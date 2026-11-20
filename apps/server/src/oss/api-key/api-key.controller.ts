// Bolder fork: endpoints for a member's own personal API keys, plus the admin overview.
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise API-key code. Every route is
// POST, like the rest of Docmost's internal API. The controller is only registered when
// API_KEYS_ENABLED is on at boot (api-key.module.ts), so with the switch off these paths are
// plain 404s.
//
// A key-authenticated request is refused (403) by the service: a leaked key must not be able
// to mint more keys or revoke the owner's other ones. `req.raw.apiKeyId` is set by JwtStrategy.
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { AuthWorkspace } from '../../common/decorators/auth-workspace.decorator';
import { User, Workspace } from '@docmost/db/types/entity.types';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto, RevokeApiKeyDto } from './dto/api-key.dto';

@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/')
  list(@AuthUser() user: User, @AuthWorkspace() workspace: Workspace, @Req() req: any) {
    return this.apiKeyService.list(user, workspace.id, req.raw?.apiKeyId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('create')
  create(
    @Body() dto: CreateApiKeyDto,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
    @Req() req: any,
  ) {
    return this.apiKeyService.create(user, workspace.id, dto, req.raw?.apiKeyId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('revoke')
  revoke(
    @Body() dto: RevokeApiKeyDto,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
    @Req() req: any,
  ) {
    return this.apiKeyService.revoke(user, workspace.id, dto.apiKeyId, req.raw?.apiKeyId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('workspace')
  listWorkspace(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
    @Req() req: any,
  ) {
    return this.apiKeyService.listWorkspace(user, workspace.id, req.raw?.apiKeyId);
  }
}
