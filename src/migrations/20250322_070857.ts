import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tags" ADD COLUMN "slug" varchar;
  ALTER TABLE "tags" ADD COLUMN "slug_lock" boolean DEFAULT true;
  CREATE INDEX IF NOT EXISTS "tags_slug_idx" ON "tags" USING btree ("slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "tags_slug_idx";
  ALTER TABLE "tags" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "tags" DROP COLUMN IF EXISTS "slug_lock";`)
}
