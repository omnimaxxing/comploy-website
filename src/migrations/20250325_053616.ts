import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_plugin_reports_report_type" AS ENUM('deletion', 'content-violation', 'security', 'copyright', 'other');
  CREATE TYPE "public"."enum_plugin_reports_status" AS ENUM('pending', 'in-review', 'resolved', 'rejected');
  CREATE TABLE IF NOT EXISTS "plugin_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"report_type" "enum_plugin_reports_report_type" NOT NULL,
  	"plugin_name" varchar NOT NULL,
  	"plugin_slug" varchar NOT NULL,
  	"reporter_name" varchar NOT NULL,
  	"reporter_email" varchar NOT NULL,
  	"is_owner" boolean DEFAULT false,
  	"message" varchar NOT NULL,
  	"status" "enum_plugin_reports_status" DEFAULT 'pending',
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "plugin_reports_id" integer;
  CREATE INDEX IF NOT EXISTS "plugin_reports_updated_at_idx" ON "plugin_reports" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "plugin_reports_created_at_idx" ON "plugin_reports" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_plugin_reports_fk" FOREIGN KEY ("plugin_reports_id") REFERENCES "public"."plugin_reports"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_plugin_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("plugin_reports_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "plugin_reports" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "plugin_reports" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_plugin_reports_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_plugin_reports_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "plugin_reports_id";
  DROP TYPE "public"."enum_plugin_reports_report_type";
  DROP TYPE "public"."enum_plugin_reports_status";`)
}
