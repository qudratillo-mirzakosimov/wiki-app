import { Module } from '@nestjs/common';
import { SessionModule } from '../../core/session/session.module';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';

@Module({
  imports: [SessionModule],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService],
})
export class GoogleAuthModule {}
