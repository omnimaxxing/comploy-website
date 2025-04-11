import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_nav_nav_links_children_icon" AS ENUM('book', 'trees', 'sunset', 'zap', 'code', 'globe', 'plugin', 'user');
  CREATE TABLE IF NOT EXISTS "search_comments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"comment" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "nav_nav_links_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"description" varchar,
  	"icon" "enum_nav_nav_links_children_icon"
  );
  
  ALTER TABLE "releases_bug_fixes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "releases_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "releases_documentation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "releases_tests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "releases_chores" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "releases_contributors" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "releases_bug_fixes" CASCADE;
  DROP TABLE "releases_features" CASCADE;
  DROP TABLE "releases_documentation" CASCADE;
  DROP TABLE "releases_tests" CASCADE;
  DROP TABLE "releases_chores" CASCADE;
  DROP TABLE "releases_contributors" CASCADE;
  ALTER TABLE "nav" ALTER COLUMN "contact_button_label" SET DEFAULT 'Submit';
  ALTER TABLE "nav" ALTER COLUMN "contact_button_url" SET DEFAULT '/submit';
  ALTER TABLE "releases" ADD COLUMN "contributors" varchar;
  ALTER TABLE "nav_nav_links" ADD COLUMN "has_children" boolean DEFAULT false;
  DO $$ BEGIN
   ALTER TABLE "search_comments" ADD CONSTRAINT "search_comments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "nav_nav_links_children" ADD CONSTRAINT "nav_nav_links_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nav_nav_links"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "search_comments_order_idx" ON "search_comments" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "search_comments_parent_id_idx" ON "search_comments" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "nav_nav_links_children_order_idx" ON "nav_nav_links_children" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "nav_nav_links_children_parent_id_idx" ON "nav_nav_links_children" USING btree ("_parent_id");
  ALTER TABLE "public"."payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "public"."payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "public"."payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "public"."payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'updateGitHubData' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'fetchPayloadReleases' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'updateGitHubData' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'fetchPayloadReleases' BEFORE 'schedulePublish';
  CREATE TABLE IF NOT EXISTS "releases_bug_fixes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"issue_number" numeric,
  	"commit_hash" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "releases_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"issue_number" numeric,
  	"commit_hash" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "releases_documentation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"issue_number" numeric,
  	"commit_hash" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "releases_tests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"issue_number" numeric,
  	"commit_hash" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "releases_chores" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"issue_number" numeric,
  	"commit_hash" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "releases_contributors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"github_username" varchar
  );
  
  ALTER TABLE "search_comments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nav_nav_links_children" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "search_comments" CASCADE;
  DROP TABLE "nav_nav_links_children" CASCADE;
  ALTER TABLE "nav" ALTER COLUMN "contact_button_label" SET DEFAULT 'Contact Us';
  ALTER TABLE "nav" ALTER COLUMN "contact_button_url" SET DEFAULT '/contact';
  DO $$ BEGIN
   ALTER TABLE "releases_bug_fixes" ADD CONSTRAINT "releases_bug_fixes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "releases_features" ADD CONSTRAINT "releases_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "releases_documentation" ADD CONSTRAINT "releases_documentation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "releases_tests" ADD CONSTRAINT "releases_tests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "releases_chores" ADD CONSTRAINT "releases_chores_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "releases_contributors" ADD CONSTRAINT "releases_contributors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "releases_bug_fixes_order_idx" ON "releases_bug_fixes" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "releases_bug_fixes_parent_id_idx" ON "releases_bug_fixes" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "releases_features_order_idx" ON "releases_features" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "releases_features_parent_id_idx" ON "releases_features" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "releases_documentation_order_idx" ON "releases_documentation" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "releases_documentation_parent_id_idx" ON "releases_documentation" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "releases_tests_order_idx" ON "releases_tests" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "releases_tests_parent_id_idx" ON "releases_tests" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "releases_chores_order_idx" ON "releases_chores" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "releases_chores_parent_id_idx" ON "releases_chores" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "releases_contributors_order_idx" ON "releases_contributors" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "releases_contributors_parent_id_idx" ON "releases_contributors" USING btree ("_parent_id");
  ALTER TABLE "releases" DROP COLUMN IF EXISTS "contributors";
  ALTER TABLE "nav_nav_links" DROP COLUMN IF EXISTS "has_children";
  DROP TYPE "public"."enum_nav_nav_links_children_icon";`)
}
