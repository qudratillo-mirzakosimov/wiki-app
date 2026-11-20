// Bolder fork: personal API keys. Deliberately does not import AuthModule (which provides
// JwtStrategy and imports this module), so there is no cycle. UserRepo and WorkspaceRepo come
// from the global DatabaseModule; TokenModule signs the key tokens.
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise API-key code.
import { Module } from '@nestjs/common';
import { TokenModule } from '../../core/auth/token.module';
// Side-effect import, on purpose. The `controllers` list below is decided when this file is
// first evaluated, which for AuthModule happens before AppModule reaches EnvironmentModule.
// Importing it first runs ConfigModule.forRoot(), so API_KEYS_ENABLED from a .env file is
// already in process.env when the switch is read (real environment variables always are).
import '../../integrations/environment/environment.module';
import { ApiKeyController } from './api-key.controller';
import { isApiKeysEnabled } from './api-key.policy';
import { ApiKeyRepo } from './api-key.repo';
import { ApiKeyService } from './api-key.service';

@Module({
  imports: [TokenModule],
  // Switch off means no routes at all, not routes that answer 403: the feature should be
  // indistinguishable from not existing. Changing the switch needs a restart.
  controllers: isApiKeysEnabled() ? [ApiKeyController] : [],
  providers: [ApiKeyRepo, ApiKeyService],
  exports: [ApiKeyService, ApiKeyRepo],
})
export class ApiKeyModule {}
