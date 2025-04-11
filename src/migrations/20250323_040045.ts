import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "showcases_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_showcases_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  DO $$ BEGIN
   ALTER TABLE "showcases_rels" ADD CONSTRAINT "showcases_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."showcases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcases_rels" ADD CONSTRAINT "showcases_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcases_v_rels" ADD CONSTRAINT "_showcases_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_showcases_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcases_v_rels" ADD CONSTRAINT "_showcases_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "showcases_rels_order_idx" ON "showcases_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "showcases_rels_parent_idx" ON "showcases_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "showcases_rels_path_idx" ON "showcases_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "showcases_rels_tags_id_idx" ON "showcases_rels" USING btree ("tags_id");
  CREATE INDEX IF NOT EXISTS "_showcases_v_rels_order_idx" ON "_showcases_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_showcases_v_rels_parent_idx" ON "_showcases_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_showcases_v_rels_path_idx" ON "_showcases_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_showcases_v_rels_tags_id_idx" ON "_showcases_v_rels" USING btree ("tags_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "showcases_rels" CASCADE;
  DROP TABLE "_showcases_v_rels" CASCADE;`)
}
