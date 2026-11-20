// Bolder fork: personal API keys. Deliberately does not import AuthModule (which provides
// JwtStrategy and imports this module), so there is no cycle. UserRepo and WorkspaceRepo come
// from the global DatabaseModule.
import { Module } from '@nestjs/common';
import { ApiKeyRepo } from './api-key.repo';
import { ApiKeyService } from './api-key.service';

@Module({
  providers: [ApiKeyRepo, ApiKeyService],
  exports: [ApiKeyService, ApiKeyRepo],
})
export class ApiKeyModule {}
