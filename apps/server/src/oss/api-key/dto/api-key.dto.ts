// Bolder fork: request bodies for the personal API key endpoints.
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise API-key code.
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// "1y" is the default: long enough that a connector is not re-minted constantly, short
// enough that an abandoned key does not live forever. "never" is offered because some MCP
// clients cannot be re-pasted easily; the owner can revoke at any time either way.
export const API_KEY_EXPIRY_CHOICES = ['30d', '90d', '1y', 'never'] as const;
export type ApiKeyExpiry = (typeof API_KEY_EXPIRY_CHOICES)[number];

export class CreateApiKeyDto {
  // Trimmed before validation, so "   " is rejected as empty rather than stored.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsIn(API_KEY_EXPIRY_CHOICES)
  expiresIn?: ApiKeyExpiry;
}

export class RevokeApiKeyDto {
  @IsUUID()
  apiKeyId: string;
}
