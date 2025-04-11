import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "contact_global_faq_section_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_global_v_version_faq_section_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "contact_global" ADD COLUMN "faq_section_enabled" boolean DEFAULT true;
  ALTER TABLE "contact_global" ADD COLUMN "faq_section_title" varchar DEFAULT 'Frequently Asked Questions';
  ALTER TABLE "contact_global" ADD COLUMN "faq_section_subtitle" varchar DEFAULT 'Quick answers to common questions about our plugin platform';
  ALTER TABLE "contact_global" ADD COLUMN "cta_section_enabled" boolean DEFAULT true;
  ALTER TABLE "contact_global" ADD COLUMN "cta_section_title" varchar DEFAULT 'Ready to share your plugin?';
  ALTER TABLE "contact_global" ADD COLUMN "cta_section_description" varchar DEFAULT 'Contribute to the Payload CMS ecosystem by sharing your plugins with the community.';
  ALTER TABLE "contact_global" ADD COLUMN "cta_section_button_text" varchar DEFAULT 'Submit Your Plugin';
  ALTER TABLE "contact_global" ADD COLUMN "cta_section_button_link" varchar DEFAULT '/plugins/submit';
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_faq_section_enabled" boolean DEFAULT true;
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_faq_section_title" varchar DEFAULT 'Frequently Asked Questions';
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_faq_section_subtitle" varchar DEFAULT 'Quick answers to common questions about our plugin platform';
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_cta_section_enabled" boolean DEFAULT true;
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_cta_section_title" varchar DEFAULT 'Ready to share your plugin?';
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_cta_section_description" varchar DEFAULT 'Contribute to the Payload CMS ecosystem by sharing your plugins with the community.';
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_cta_section_button_text" varchar DEFAULT 'Submit Your Plugin';
  ALTER TABLE "_contact_global_v" ADD COLUMN "version_cta_section_button_link" varchar DEFAULT '/plugins/submit';
  DO $$ BEGIN
   ALTER TABLE "contact_global_faq_section_faqs" ADD CONSTRAINT "contact_global_faq_section_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_contact_global_v_version_faq_section_faqs" ADD CONSTRAINT "_contact_global_v_version_faq_section_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "contact_global_faq_section_faqs_order_idx" ON "contact_global_faq_section_faqs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_global_faq_section_faqs_parent_id_idx" ON "contact_global_faq_section_faqs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_faq_section_faqs_order_idx" ON "_contact_global_v_version_faq_section_faqs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_faq_section_faqs_parent_id_idx" ON "_contact_global_v_version_faq_section_faqs" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_global_faq_section_faqs" CASCADE;
  DROP TABLE "_contact_global_v_version_faq_section_faqs" CASCADE;
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "faq_section_enabled";
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "faq_section_title";
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "faq_section_subtitle";
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "cta_section_enabled";
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "cta_section_title";
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "cta_section_description";
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "cta_section_button_text";
  ALTER TABLE "contact_global" DROP COLUMN IF EXISTS "cta_section_button_link";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_faq_section_enabled";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_faq_section_title";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_faq_section_subtitle";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_cta_section_enabled";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_cta_section_title";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_cta_section_description";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_cta_section_button_text";
  ALTER TABLE "_contact_global_v" DROP COLUMN IF EXISTS "version_cta_section_button_link";`)
}
