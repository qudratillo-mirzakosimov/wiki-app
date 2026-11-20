// Bolder fork: persistence for personal API keys (the `api_keys` table core already ships).
//
// Written for this fork (AGPL-3.0). It lives in this module rather than in database.module.ts
// so upstream merges of the database module stay clean.
import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { sql } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { KyselyDB } from '@docmost/db/types/kysely.types';
import { ApiKey, InsertableApiKey } from '@docmost/db/types/entity.types';

export type ApiKeyWithCreator = ApiKey & {
  creator: { id: string; name: string; email: string };
};

@Injectable()
export class ApiKeyRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async insert(row: InsertableApiKey): Promise<ApiKey> {
    return this.db
      .insertInto('apiKeys')
      .values(row)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // Includes revoked rows on purpose: the validator reads deletedAt itself to reject them.
  async findById(id: string): Promise<ApiKey | undefined> {
    return this.db
      .selectFrom('apiKeys')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async listByCreator(creatorId: string, workspaceId: string): Promise<ApiKey[]> {
    return this.db
      .selectFrom('apiKeys')
      .selectAll()
      .where('creatorId', '=', creatorId)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .orderBy('createdAt', 'desc')
      .execute();
  }

  async listByWorkspace(workspaceId: string): Promise<ApiKeyWithCreator[]> {
    const rows = await this.db
      .selectFrom('apiKeys')
      .selectAll('apiKeys')
      .select((eb) =>
        jsonObjectFrom(
          eb
            .selectFrom('users')
            .select(['users.id', 'users.name', 'users.email'])
            .whereRef('users.id', '=', 'apiKeys.creatorId'),
        ).as('creator'),
      )
      .where('apiKeys.workspaceId', '=', workspaceId)
      .where('apiKeys.deletedAt', 'is', null)
      .orderBy('apiKeys.createdAt', 'desc')
      .execute();
    return rows as ApiKeyWithCreator[];
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .updateTable('apiKeys')
      .set({ deletedAt: sql`now()`, updatedAt: sql`now()` })
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .execute();
  }

  // Only lastUsedAt moves: updatedAt would make every authenticated request look like an edit.
  async touchLastUsed(id: string): Promise<void> {
    await this.db
      .updateTable('apiKeys')
      .set({ lastUsedAt: sql`now()` })
      .where('id', '=', id)
      .execute();
  }
}
