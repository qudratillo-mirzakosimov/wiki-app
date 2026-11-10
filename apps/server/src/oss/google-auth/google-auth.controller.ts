import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Workspace } from '@docmost/db/types/entity.types';
import { AuthWorkspace } from '../../common/decorators/auth-workspace.decorator';
import { AI_CHAT_THROTTLER } from '../../integrations/throttle/throttler-names';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthRejected } from './google-auth.policy';
import {
  decodeFlowState,
  encodeFlowState,
  GOOGLE_STATE_COOKIE,
  GOOGLE_STATE_TTL_SECONDS,
} from './google-auth.state';

const STATE_COOKIE_PATH = '/api/auth/google';

// Same AUTH throttler as password login (10/min/IP): both routes start or finish a sign-in.
@SkipThrottle({ [AI_CHAT_THROTTLER]: true })
@UseGuards(ThrottlerGuard)
@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly googleAuth: GoogleAuthService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  async start(@Res() res: FastifyReply) {
    if (!this.googleAuth.isEnabled()) throw new NotFoundException();

    const { url, flow } = await this.googleAuth.start();
    res.setCookie(
      GOOGLE_STATE_COOKIE,
      encodeFlowState(flow, this.environmentService.getAppSecret()),
      {
        httpOnly: true,
        // lax, not strict: Google's redirect back is a cross-site top-level GET, which
        // strict would strip the cookie from.
        sameSite: 'lax',
        path: STATE_COOKIE_PATH,
        maxAge: GOOGLE_STATE_TTL_SECONDS,
        secure: this.environmentService.isHttps(),
      },
    );
    return this.redirect(res, url);
  }

  @Get('callback')
  async callback(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @AuthWorkspace() workspace: Workspace,
  ) {
    if (!this.googleAuth.isEnabled()) throw new NotFoundException();

    // One-shot: the cookie is cleared whatever the outcome.
    const flow = decodeFlowState(
      req.cookies?.[GOOGLE_STATE_COOKIE],
      this.environmentService.getAppSecret(),
    );
    res.clearCookie(GOOGLE_STATE_COOKIE, { path: STATE_COOKIE_PATH });

    const query = (req.query ?? {}) as Record<string, string>;
    if (query.error) return this.fail(res, 'cancelled');
    if (!flow) return this.fail(res, 'failed');

    try {
      const callbackUrl = new URL(req.url, this.environmentService.getAppUrl());
      const authToken = await this.googleAuth.finish(callbackUrl, flow, workspace);
      res.setCookie('authToken', authToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        expires: this.environmentService.getCookieExpiresIn(),
        secure: this.environmentService.isHttps(),
      });
      return this.redirect(res, '/home');
    } catch (err) {
      if (err instanceof GoogleAuthRejected) return this.fail(res, err.reason);
      this.logger.error(`Google sign-in failed: ${(err as Error).message}`);
      return this.fail(res, 'failed');
    }
  }

  private fail(res: FastifyReply, reason: string) {
    return this.redirect(res, `/login?google_error=${encodeURIComponent(reason)}`);
  }

  private redirect(res: FastifyReply, location: string) {
    return res.code(302).header('location', location).send();
  }
}
