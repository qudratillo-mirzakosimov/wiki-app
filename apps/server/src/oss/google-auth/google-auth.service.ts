// Bolder fork: "Sign in with Google" on top of the core session machinery.
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise SSO code or its
// auth_providers table. Configuration is per instance through the environment
// (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_ALLOWED_DOMAINS), so the internal and
// client instances can differ without an admin UI.
//
// Policy: Google only proves who the person is. They must already be an active member of
// the workspace (invited and accepted); nobody is created here. Password login stays,
// because the gateway service accounts sign in with a password.
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as oidc from 'openid-client';
import { UserRepo } from '@docmost/db/repos/user/user.repo';
import { Workspace } from '@docmost/db/types/entity.types';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { SessionService } from '../../core/session/session.service';
import { isUserDisabled } from '../../common/helpers/utils';
import { AuditEvent, AuditResource } from '../../common/events/audit-events';
import {
  AUDIT_SERVICE,
  IAuditService,
} from '../../integrations/audit/audit.service';
import {
  acceptGoogleClaims,
  GoogleAuthConfig,
  GoogleAuthRejected,
  readGoogleAuthConfig,
} from './google-auth.policy';
import { GOOGLE_STATE_TTL_SECONDS, GoogleFlowState } from './google-auth.state';

const GOOGLE_ISSUER = new URL('https://accounts.google.com');

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private readonly config: GoogleAuthConfig | null = readGoogleAuthConfig();
  private discovery?: Promise<oidc.Configuration>;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly sessionService: SessionService,
    private readonly userRepo: UserRepo,
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {
    if (this.config) {
      this.logger.log(
        `Google sign-in enabled for: ${this.config.allowedDomains.join(', ')}`,
      );
    }
  }

  isEnabled(): boolean {
    return this.config !== null;
  }

  redirectUri(): string {
    return `${this.environmentService.getAppUrl()}/api/auth/google/callback`;
  }

  // Cached, but a failed discovery is dropped so the next sign-in retries instead of the
  // instance being stuck until restart.
  private getClient(): Promise<oidc.Configuration> {
    if (!this.discovery) {
      this.discovery = oidc
        .discovery(GOOGLE_ISSUER, this.config!.clientId, this.config!.clientSecret)
        .catch((err) => {
          this.discovery = undefined;
          throw err;
        });
    }
    return this.discovery;
  }

  async start(): Promise<{ url: string; flow: GoogleFlowState }> {
    const client = await this.getClient();
    const flow: GoogleFlowState = {
      state: oidc.randomState(),
      nonce: oidc.randomNonce(),
      codeVerifier: oidc.randomPKCECodeVerifier(),
      expiresAt: Date.now() + GOOGLE_STATE_TTL_SECONDS * 1000,
    };

    const params: Record<string, string> = {
      redirect_uri: this.redirectUri(),
      scope: 'openid email profile',
      state: flow.state,
      nonce: flow.nonce,
      code_challenge: await oidc.calculatePKCECodeChallenge(flow.codeVerifier),
      code_challenge_method: 'S256',
      prompt: 'select_account',
    };
    // `hd` only narrows Google's account picker; the real check is acceptGoogleClaims.
    if (this.config!.allowedDomains.length === 1) {
      params.hd = this.config!.allowedDomains[0];
    }

    return { url: oidc.buildAuthorizationUrl(client, params).href, flow };
  }

  // Exchanges the code, validates the ID token (signature, issuer, audience, expiry, nonce,
  // state, PKCE — all inside openid-client) and returns a session token for the member.
  async finish(
    callbackUrl: URL,
    flow: GoogleFlowState,
    workspace: Workspace,
  ): Promise<string> {
    const client = await this.getClient();

    let claims: Record<string, unknown>;
    try {
      const tokens = await oidc.authorizationCodeGrant(client, callbackUrl, {
        pkceCodeVerifier: flow.codeVerifier,
        expectedState: flow.state,
        expectedNonce: flow.nonce,
        idTokenExpected: true,
      });
      claims = (tokens.claims() ?? {}) as Record<string, unknown>;
    } catch (err) {
      this.logger.warn(`Google token exchange failed: ${(err as Error).message}`);
      throw new GoogleAuthRejected('failed');
    }

    const email = acceptGoogleClaims(claims, this.config!.allowedDomains);

    const user = await this.userRepo.findByEmail(email, workspace.id);
    if (!user || isUserDisabled(user)) {
      throw new GoogleAuthRejected('not_a_member');
    }

    await this.userRepo.updateLastLogin(user.id, workspace.id);
    this.auditService.log({
      event: AuditEvent.USER_LOGIN,
      resourceType: AuditResource.USER,
      resourceId: user.id,
      metadata: { source: 'google' },
    });

    return this.sessionService.createSessionAndToken(user);
  }
}
