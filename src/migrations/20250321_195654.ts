import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'user');
  CREATE TYPE "public"."enum_users_origin" AS ENUM('manual', 'google', 'apple');
  CREATE TYPE "public"."enum_legal_docs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_docs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'in-progress', 'completed', 'archived');
  CREATE TYPE "public"."enum_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_showcases_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__showcases_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tags_color" AS ENUM('blue', 'green', 'red', 'purple', 'yellow', 'orange', 'pink', 'gray');
  CREATE TYPE "public"."enum_plugins_install_commands_package_manager" AS ENUM('npm', 'yarn', 'pnpm', 'bun', 'other');
  CREATE TYPE "public"."enum_plugins_verification_github_verification_method" AS ENUM('owner', 'contributor', 'manual');
  CREATE TYPE "public"."enum_plugins_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__plugins_v_version_install_commands_package_manager" AS ENUM('npm', 'yarn', 'pnpm', 'bun', 'other');
  CREATE TYPE "public"."enum__plugins_v_version_verification_github_verification_method" AS ENUM('owner', 'contributor', 'manual');
  CREATE TYPE "public"."enum__plugins_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_resources_resource_type" AS ENUM('tutorial', 'blog', 'video', 'tool');
  CREATE TYPE "public"."enum_resources_source" AS ENUM('external', 'internal');
  CREATE TYPE "public"."enum_resources_source_platform" AS ENUM('youtube', 'medium', 'github', 'dev', 'other');
  CREATE TYPE "public"."enum_resources_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_resources_status" AS ENUM('pending', 'published', 'rejected');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'updateGitHubData', 'fetchPayloadReleases', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'updateGitHubData', 'fetchPayloadReleases', 'schedulePublish');
  CREATE TYPE "public"."enum_contact_global_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_global_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_showcase_global_hero_submit_button_variant" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_showcase_global_hero_submit_button_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_showcase_global_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__showcase_global_v_version_hero_submit_button_variant" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum__showcase_global_v_version_hero_submit_button_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__showcase_global_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_about_global_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_global_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_home_global_powered_by_section_tech_logos_style" AS ENUM('white', 'dark');
  CREATE TYPE "public"."enum_plugins_global_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__plugins_global_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE IF NOT EXISTS "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"first_name" varchar,
  	"last_name" varchar,
  	"phone" varchar,
  	"origin" "enum_users_origin" DEFAULT 'manual' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"blur_data_u_r_l" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_blur_url" varchar,
  	"sizes_blur_width" numeric,
  	"sizes_blur_height" numeric,
  	"sizes_blur_mime_type" varchar,
  	"sizes_blur_filesize" numeric,
  	"sizes_blur_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"gradient_from" varchar,
  	"gradient_to" varchar,
  	"url" varchar NOT NULL,
  	"new_tab" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "legal_docs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_legal_docs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "_legal_docs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__legal_docs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"status" "enum_contact_submissions_status" DEFAULT 'new',
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "svgs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"title" varchar,
  	"prefix" varchar DEFAULT 'svgs',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"price" numeric,
  	"featured" boolean DEFAULT false,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_price" numeric,
  	"version_featured" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "showcases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"website_url" varchar,
  	"github_url" varchar,
  	"image_id" integer,
  	"featured" boolean DEFAULT false,
  	"views" numeric DEFAULT 0,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_showcases_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "_showcases_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_website_url" varchar,
  	"version_github_url" varchar,
  	"version_image_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_views" numeric DEFAULT 0,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__showcases_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"icon" varchar DEFAULT 'heroicons:puzzle-piece',
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"color" "enum_tags_color" DEFAULT 'blue',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_install_commands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"package_manager" "enum_plugins_install_commands_package_manager",
  	"custom_label" varchar,
  	"command" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_comments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"comment" varchar,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "plugins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_description" varchar,
  	"github_url" varchar,
  	"category_id" integer,
  	"is_official" boolean DEFAULT false,
  	"full_description" jsonb,
  	"related_links_npm_url" varchar,
  	"related_links_demo_url" varchar,
  	"related_links_video_url" varchar,
  	"main_image_id" integer,
  	"github_data_stars" numeric,
  	"github_data_forks" numeric,
  	"github_data_owner" varchar,
  	"github_data_last_commit" timestamp(3) with time zone,
  	"github_data_license" varchar,
  	"github_data_last_updated" timestamp(3) with time zone,
  	"verification_is_verified" boolean DEFAULT false,
  	"verification_verified_by" varchar,
  	"verification_verified_at" timestamp(3) with time zone,
  	"verification_github_verification_user_id" varchar,
  	"verification_github_verification_username" varchar,
  	"verification_github_verification_method" "enum_plugins_verification_github_verification_method",
  	"rating_upvotes" numeric DEFAULT 0,
  	"rating_downvotes" numeric DEFAULT 0,
  	"rating_score" numeric DEFAULT 0,
  	"views" numeric DEFAULT 0,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_plugins_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_v_version_install_commands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"package_manager" "enum__plugins_v_version_install_commands_package_manager",
  	"custom_label" varchar,
  	"command" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_v_version_comments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"comment" varchar,
  	"created_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_short_description" varchar,
  	"version_github_url" varchar,
  	"version_category_id" integer,
  	"version_is_official" boolean DEFAULT false,
  	"version_full_description" jsonb,
  	"version_related_links_npm_url" varchar,
  	"version_related_links_demo_url" varchar,
  	"version_related_links_video_url" varchar,
  	"version_main_image_id" integer,
  	"version_github_data_stars" numeric,
  	"version_github_data_forks" numeric,
  	"version_github_data_owner" varchar,
  	"version_github_data_last_commit" timestamp(3) with time zone,
  	"version_github_data_license" varchar,
  	"version_github_data_last_updated" timestamp(3) with time zone,
  	"version_verification_is_verified" boolean DEFAULT false,
  	"version_verification_verified_by" varchar,
  	"version_verification_verified_at" timestamp(3) with time zone,
  	"version_verification_github_verification_user_id" varchar,
  	"version_verification_github_verification_username" varchar,
  	"version_verification_github_verification_method" "enum__plugins_v_version_verification_github_verification_method",
  	"version_rating_upvotes" numeric DEFAULT 0,
  	"version_rating_downvotes" numeric DEFAULT 0,
  	"version_rating_score" numeric DEFAULT 0,
  	"version_views" numeric DEFAULT 0,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__plugins_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"resource_type" "enum_resources_resource_type" NOT NULL,
  	"source" "enum_resources_source" NOT NULL,
  	"external_link" varchar,
  	"image_id" integer,
  	"source_platform" "enum_resources_source_platform",
  	"video_i_d" varchar,
  	"content" jsonb,
  	"author_id" integer,
  	"difficulty" "enum_resources_difficulty",
  	"featured" boolean DEFAULT false,
  	"published_date" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"status" "enum_resources_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "resources_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
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
  
  CREATE TABLE IF NOT EXISTS "releases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version" varchar NOT NULL,
  	"release_date" timestamp(3) with time zone NOT NULL,
  	"is_breaking" boolean DEFAULT false,
  	"content" varchar NOT NULL,
  	"github_release_id" varchar,
  	"last_synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"short_description" varchar,
  	"category_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"plugins_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"links_id" integer,
  	"legal_docs_id" integer,
  	"contact_submissions_id" integer,
  	"svgs_id" integer,
  	"items_id" integer,
  	"showcases_id" integer,
  	"categories_id" integer,
  	"tags_id" integer,
  	"plugins_id" integer,
  	"resources_id" integer,
  	"releases_id" integer,
  	"search_id" integer,
  	"payload_jobs_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "nav_nav_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "nav" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Your Brand',
  	"contact_button_enabled" boolean DEFAULT true,
  	"contact_button_label" varchar DEFAULT 'Contact Us',
  	"contact_button_url" varchar DEFAULT '/contact',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "contact_global_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_global_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "contact_global_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"selector" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_global_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "contact_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_is_answer_page" boolean,
  	"seo_how_to_name" varchar,
  	"seo_how_to_description" varchar,
  	"content_title" varchar DEFAULT 'Contact Us',
  	"content_subtitle" varchar DEFAULT 'We''''d love to hear from you. Fill out the form below and we''''ll get back to you as soon as possible.',
  	"content_form_title" varchar DEFAULT 'Send us a message',
  	"content_contact_info_email" varchar DEFAULT 'contact@example.com',
  	"content_contact_info_phone" varchar DEFAULT '(123) 456-7890',
  	"content_contact_info_address" varchar DEFAULT '123 Main Street
  Anytown, USA 12345',
  	"_status" "enum_contact_global_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_global_v_version_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_global_v_version_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_global_v_version_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"selector" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_global_v_version_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_contact_global_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_is_answer_page" boolean,
  	"version_seo_how_to_name" varchar,
  	"version_seo_how_to_description" varchar,
  	"version_content_title" varchar DEFAULT 'Contact Us',
  	"version_content_subtitle" varchar DEFAULT 'We''''d love to hear from you. Fill out the form below and we''''ll get back to you as soon as possible.',
  	"version_content_form_title" varchar DEFAULT 'Send us a message',
  	"version_content_contact_info_email" varchar DEFAULT 'contact@example.com',
  	"version_content_contact_info_phone" varchar DEFAULT '(123) 456-7890',
  	"version_content_contact_info_address" varchar DEFAULT '123 Main Street
  Anytown, USA 12345',
  	"version__status" "enum__contact_global_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "footer_link_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "footer_link_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"label" varchar NOT NULL,
  	"custom_url" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tagline" varchar DEFAULT 'Discover and share plugins for Payload CMS. Extend your headless CMS with community-built solutions.',
  	"official_links_discord" varchar DEFAULT 'https://discord.com/invite/payload',
  	"official_links_discord_icon" varchar DEFAULT 'heroicons:puzzle-piece',
  	"official_links_github" varchar DEFAULT 'https://github.com/payloadcms/payload',
  	"official_links_github_icon" varchar DEFAULT 'heroicons:puzzle-piece',
  	"official_links_website" varchar DEFAULT 'https://payloadcms.com',
  	"official_links_website_icon" varchar DEFAULT 'heroicons:puzzle-piece',
  	"additional_settings_copyright_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "showcase_global_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "showcase_global_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "showcase_global_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"selector" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "showcase_global_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "showcase_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_is_answer_page" boolean,
  	"seo_how_to_name" varchar,
  	"seo_how_to_description" varchar,
  	"hero_title" varchar DEFAULT 'Showcase Gallery',
  	"hero_description" varchar DEFAULT 'Explore websites and applications built with Payload CMS. Get inspired by real-world examples of what''''s possible.',
  	"hero_submit_button_label" varchar DEFAULT 'Submit Your Project',
  	"hero_submit_button_url" varchar DEFAULT '/showcase/submit',
  	"hero_submit_button_variant" "enum_showcase_global_hero_submit_button_variant" DEFAULT 'primary',
  	"hero_submit_button_size" "enum_showcase_global_hero_submit_button_size" DEFAULT 'lg',
  	"empty_state_title" varchar DEFAULT 'No examples yet',
  	"empty_state_message" varchar DEFAULT 'No examples have been added yet. Check back soon or submit your own Payload project!',
  	"_status" "enum_showcase_global_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_showcase_global_v_version_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_showcase_global_v_version_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_showcase_global_v_version_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"selector" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_showcase_global_v_version_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_showcase_global_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_is_answer_page" boolean,
  	"version_seo_how_to_name" varchar,
  	"version_seo_how_to_description" varchar,
  	"version_hero_title" varchar DEFAULT 'Showcase Gallery',
  	"version_hero_description" varchar DEFAULT 'Explore websites and applications built with Payload CMS. Get inspired by real-world examples of what''''s possible.',
  	"version_hero_submit_button_label" varchar DEFAULT 'Submit Your Project',
  	"version_hero_submit_button_url" varchar DEFAULT '/showcase/submit',
  	"version_hero_submit_button_variant" "enum__showcase_global_v_version_hero_submit_button_variant" DEFAULT 'primary',
  	"version_hero_submit_button_size" "enum__showcase_global_v_version_hero_submit_button_size" DEFAULT 'lg',
  	"version_empty_state_title" varchar DEFAULT 'No examples yet',
  	"version_empty_state_message" varchar DEFAULT 'No examples have been added yet. Check back soon or submit your own Payload project!',
  	"version__status" "enum__showcase_global_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "about_global_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_global_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "about_global_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"selector" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_global_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "about_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_is_answer_page" boolean,
  	"seo_how_to_name" varchar,
  	"seo_how_to_description" varchar,
  	"hero_title" varchar DEFAULT 'Our Mission',
  	"hero_subtitle" varchar DEFAULT 'Building a better ecosystem for the Payload CMS community',
  	"main_content" jsonb,
  	"footer_quote" varchar DEFAULT '"All things Payload, all in one place."',
  	"footer_button_text" varchar DEFAULT 'Join Our Mission',
  	"footer_button_link" varchar DEFAULT '/submit',
  	"_status" "enum_about_global_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_about_global_v_version_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_about_global_v_version_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_about_global_v_version_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"selector" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_about_global_v_version_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_about_global_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_is_answer_page" boolean,
  	"version_seo_how_to_name" varchar,
  	"version_seo_how_to_description" varchar,
  	"version_hero_title" varchar DEFAULT 'Our Mission',
  	"version_hero_subtitle" varchar DEFAULT 'Building a better ecosystem for the Payload CMS community',
  	"version_main_content" jsonb,
  	"version_footer_quote" varchar DEFAULT '"All things Payload, all in one place."',
  	"version_footer_button_text" varchar DEFAULT 'Join Our Mission',
  	"version_footer_button_link" varchar DEFAULT '/submit',
  	"version__status" "enum__about_global_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"selector" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_explore_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"link_text" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"coming_soon" boolean DEFAULT false
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_share_section_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_community_section_community_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"button_label" varchar NOT NULL,
  	"button_url" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "home_global_powered_by_section_tech_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_image_id" integer NOT NULL,
  	"href" varchar NOT NULL,
  	"style" "enum_home_global_powered_by_section_tech_logos_style" DEFAULT 'dark'
  );
  
  CREATE TABLE IF NOT EXISTS "home_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"seo_keywords" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_is_answer_page" boolean,
  	"seo_how_to_name" varchar,
  	"seo_how_to_description" varchar,
  	"hero_headline" varchar DEFAULT 'Discover & Share Plugins for Payload CMS',
  	"hero_subtitle" varchar DEFAULT 'Extend your headless CMS with community-built plugins, components, and code examples.',
  	"hero_explore_button_label" varchar DEFAULT 'Explore Plugins',
  	"hero_explore_button_url" varchar DEFAULT '/plugins',
  	"hero_submit_button_label" varchar DEFAULT 'Submit Your Plugin',
  	"hero_submit_button_url" varchar DEFAULT '/submit',
  	"about_section_title" varchar DEFAULT 'About Payload Plugins',
  	"about_section_content" jsonb,
  	"about_section_learn_more_button_label" varchar DEFAULT 'Learn More',
  	"about_section_learn_more_button_url" varchar DEFAULT '/about',
  	"share_section_title" varchar DEFAULT 'Share with the Community',
  	"share_section_description" varchar DEFAULT 'Built a plugin for Payload CMS or created a website or application using Payload? Share your work with the community to inspire others and showcase your expertise.',
  	"share_section_submit_button_label" varchar DEFAULT 'Submit Your Plugin',
  	"share_section_submit_button_url" varchar DEFAULT '/submit',
  	"share_section_showcase_button_label" varchar DEFAULT 'Add to Showcase',
  	"share_section_showcase_button_url" varchar DEFAULT '/submit-showcase',
  	"community_section_title" varchar DEFAULT 'Join the Payload CMS Community',
  	"community_section_description" varchar DEFAULT 'Payload Plugins is an independent directory that works alongside the official Payload CMS community. Connect with Payload developers, get help, and stay updated with the latest news.',
  	"community_section_credit_section_text" varchar DEFAULT 'Payload Plugins created by',
  	"community_section_credit_section_link_text" varchar DEFAULT 'Omnipixel',
  	"community_section_credit_section_link_url" varchar DEFAULT 'https://omnipixel.io',
  	"powered_by_section_title" varchar DEFAULT 'This site is powered by',
  	"powered_by_section_gap_size" varchar DEFAULT '60px',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_global_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_global_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_global_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"selector" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_global_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_global_hero_animated_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_is_answer_page" boolean,
  	"seo_how_to_name" varchar,
  	"seo_how_to_description" varchar,
  	"hero_title" varchar DEFAULT 'Our Mission',
  	"hero_subtitle" varchar DEFAULT 'Building a better ecosystem for the Payload CMS community',
  	"hero_button1_button_text" varchar DEFAULT 'Learn More',
  	"hero_button1_button_link_id" integer,
  	"hero_button2_button_text" varchar DEFAULT 'Learn More',
  	"hero_button2_button_link_id" integer,
  	"featured_section_title" varchar DEFAULT 'Featured Plugins',
  	"featured_section_subtitle" varchar DEFAULT 'Highlighted plugins selected by our team',
  	"featured_section_main_plugin_id" integer,
  	"popular_section_title" varchar DEFAULT 'Popular Plugins',
  	"popular_section_subtitle" varchar DEFAULT 'Well-established plugins trusted by the community',
  	"recent_plugins_title" varchar DEFAULT 'Recent Plugins',
  	"recent_plugins_subtitle" varchar DEFAULT 'Newest additions to our plugin ecosystem',
  	"_status" "enum_plugins_global_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "plugins_global_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"plugins_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_global_v_version_seo_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_global_v_version_seo_how_to_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_global_v_version_seo_speakable_css_selector" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"selector" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_global_v_version_seo_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_global_v_version_hero_animated_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_global_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_is_answer_page" boolean,
  	"version_seo_how_to_name" varchar,
  	"version_seo_how_to_description" varchar,
  	"version_hero_title" varchar DEFAULT 'Our Mission',
  	"version_hero_subtitle" varchar DEFAULT 'Building a better ecosystem for the Payload CMS community',
  	"version_hero_button1_button_text" varchar DEFAULT 'Learn More',
  	"version_hero_button1_button_link_id" integer,
  	"version_hero_button2_button_text" varchar DEFAULT 'Learn More',
  	"version_hero_button2_button_link_id" integer,
  	"version_featured_section_title" varchar DEFAULT 'Featured Plugins',
  	"version_featured_section_subtitle" varchar DEFAULT 'Highlighted plugins selected by our team',
  	"version_featured_section_main_plugin_id" integer,
  	"version_popular_section_title" varchar DEFAULT 'Popular Plugins',
  	"version_popular_section_subtitle" varchar DEFAULT 'Well-established plugins trusted by the community',
  	"version_recent_plugins_title" varchar DEFAULT 'Recent Plugins',
  	"version_recent_plugins_subtitle" varchar DEFAULT 'Newest additions to our plugin ecosystem',
  	"version__status" "enum__plugins_global_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_plugins_global_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"plugins_id" integer
  );
  
  DO $$ BEGIN
   ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_legal_docs_v" ADD CONSTRAINT "_legal_docs_v_parent_id_legal_docs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legal_docs"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "items" ADD CONSTRAINT "items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_items_v" ADD CONSTRAINT "_items_v_parent_id_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_items_v" ADD CONSTRAINT "_items_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcases" ADD CONSTRAINT "showcases_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcases_v" ADD CONSTRAINT "_showcases_v_parent_id_showcases_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."showcases"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcases_v" ADD CONSTRAINT "_showcases_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_install_commands" ADD CONSTRAINT "plugins_install_commands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_comments" ADD CONSTRAINT "plugins_comments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins" ADD CONSTRAINT "plugins_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins" ADD CONSTRAINT "plugins_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_rels" ADD CONSTRAINT "plugins_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_rels" ADD CONSTRAINT "plugins_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_rels" ADD CONSTRAINT "plugins_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v_version_install_commands" ADD CONSTRAINT "_plugins_v_version_install_commands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_plugins_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v_version_comments" ADD CONSTRAINT "_plugins_v_version_comments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_plugins_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v" ADD CONSTRAINT "_plugins_v_parent_id_plugins_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."plugins"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v" ADD CONSTRAINT "_plugins_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v" ADD CONSTRAINT "_plugins_v_version_main_image_id_media_id_fk" FOREIGN KEY ("version_main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v_rels" ADD CONSTRAINT "_plugins_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_plugins_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v_rels" ADD CONSTRAINT "_plugins_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_v_rels" ADD CONSTRAINT "_plugins_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resources" ADD CONSTRAINT "resources_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resources" ADD CONSTRAINT "resources_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
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
  
  DO $$ BEGIN
   ALTER TABLE "search" ADD CONSTRAINT "search_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_plugins_fk" FOREIGN KEY ("plugins_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_links_fk" FOREIGN KEY ("links_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_docs_fk" FOREIGN KEY ("legal_docs_id") REFERENCES "public"."legal_docs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_svgs_fk" FOREIGN KEY ("svgs_id") REFERENCES "public"."svgs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_items_fk" FOREIGN KEY ("items_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_showcases_fk" FOREIGN KEY ("showcases_id") REFERENCES "public"."showcases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_plugins_fk" FOREIGN KEY ("plugins_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_releases_fk" FOREIGN KEY ("releases_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk" FOREIGN KEY ("payload_jobs_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "nav_nav_links" ADD CONSTRAINT "nav_nav_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nav"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "contact_global_seo_faq" ADD CONSTRAINT "contact_global_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "contact_global_seo_how_to_steps" ADD CONSTRAINT "contact_global_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "contact_global_seo_how_to_steps" ADD CONSTRAINT "contact_global_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "contact_global_seo_speakable_css_selector" ADD CONSTRAINT "contact_global_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "contact_global_seo_breadcrumbs" ADD CONSTRAINT "contact_global_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "contact_global" ADD CONSTRAINT "contact_global_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_contact_global_v_version_seo_faq" ADD CONSTRAINT "_contact_global_v_version_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_contact_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_contact_global_v_version_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_contact_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_contact_global_v_version_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_contact_global_v_version_seo_speakable_css_selector" ADD CONSTRAINT "_contact_global_v_version_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_contact_global_v_version_seo_breadcrumbs" ADD CONSTRAINT "_contact_global_v_version_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_contact_global_v" ADD CONSTRAINT "_contact_global_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_link_columns_links" ADD CONSTRAINT "footer_link_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_link_columns"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_link_columns" ADD CONSTRAINT "footer_link_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_document_id_legal_docs_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."legal_docs"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcase_global_seo_faq" ADD CONSTRAINT "showcase_global_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showcase_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcase_global_seo_how_to_steps" ADD CONSTRAINT "showcase_global_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcase_global_seo_how_to_steps" ADD CONSTRAINT "showcase_global_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showcase_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcase_global_seo_speakable_css_selector" ADD CONSTRAINT "showcase_global_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showcase_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcase_global_seo_breadcrumbs" ADD CONSTRAINT "showcase_global_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showcase_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "showcase_global" ADD CONSTRAINT "showcase_global_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcase_global_v_version_seo_faq" ADD CONSTRAINT "_showcase_global_v_version_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_showcase_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcase_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_showcase_global_v_version_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcase_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_showcase_global_v_version_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_showcase_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcase_global_v_version_seo_speakable_css_selector" ADD CONSTRAINT "_showcase_global_v_version_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_showcase_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcase_global_v_version_seo_breadcrumbs" ADD CONSTRAINT "_showcase_global_v_version_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_showcase_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_showcase_global_v" ADD CONSTRAINT "_showcase_global_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "about_global_seo_faq" ADD CONSTRAINT "about_global_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "about_global_seo_how_to_steps" ADD CONSTRAINT "about_global_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "about_global_seo_how_to_steps" ADD CONSTRAINT "about_global_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "about_global_seo_speakable_css_selector" ADD CONSTRAINT "about_global_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "about_global_seo_breadcrumbs" ADD CONSTRAINT "about_global_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "about_global" ADD CONSTRAINT "about_global_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_about_global_v_version_seo_faq" ADD CONSTRAINT "_about_global_v_version_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_about_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_about_global_v_version_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_about_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_about_global_v_version_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_about_global_v_version_seo_speakable_css_selector" ADD CONSTRAINT "_about_global_v_version_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_about_global_v_version_seo_breadcrumbs" ADD CONSTRAINT "_about_global_v_version_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_about_global_v" ADD CONSTRAINT "_about_global_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_seo_faq" ADD CONSTRAINT "home_global_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_seo_how_to_steps" ADD CONSTRAINT "home_global_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_seo_how_to_steps" ADD CONSTRAINT "home_global_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_seo_speakable_css_selector" ADD CONSTRAINT "home_global_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_seo_breadcrumbs" ADD CONSTRAINT "home_global_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_explore_cards" ADD CONSTRAINT "home_global_explore_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_share_section_benefits" ADD CONSTRAINT "home_global_share_section_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_community_section_community_links" ADD CONSTRAINT "home_global_community_section_community_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_powered_by_section_tech_logos" ADD CONSTRAINT "home_global_powered_by_section_tech_logos_logo_image_id_media_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global_powered_by_section_tech_logos" ADD CONSTRAINT "home_global_powered_by_section_tech_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "home_global" ADD CONSTRAINT "home_global_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_seo_faq" ADD CONSTRAINT "plugins_global_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugins_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_seo_how_to_steps" ADD CONSTRAINT "plugins_global_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_seo_how_to_steps" ADD CONSTRAINT "plugins_global_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugins_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_seo_speakable_css_selector" ADD CONSTRAINT "plugins_global_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugins_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_seo_breadcrumbs" ADD CONSTRAINT "plugins_global_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugins_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_hero_animated_tags" ADD CONSTRAINT "plugins_global_hero_animated_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugins_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global" ADD CONSTRAINT "plugins_global_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global" ADD CONSTRAINT "plugins_global_hero_button1_button_link_id_links_id_fk" FOREIGN KEY ("hero_button1_button_link_id") REFERENCES "public"."links"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global" ADD CONSTRAINT "plugins_global_hero_button2_button_link_id_links_id_fk" FOREIGN KEY ("hero_button2_button_link_id") REFERENCES "public"."links"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global" ADD CONSTRAINT "plugins_global_featured_section_main_plugin_id_plugins_id_fk" FOREIGN KEY ("featured_section_main_plugin_id") REFERENCES "public"."plugins"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_rels" ADD CONSTRAINT "plugins_global_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."plugins_global"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "plugins_global_rels" ADD CONSTRAINT "plugins_global_rels_plugins_fk" FOREIGN KEY ("plugins_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_version_seo_faq" ADD CONSTRAINT "_plugins_global_v_version_seo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_plugins_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_plugins_global_v_version_seo_how_to_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_version_seo_how_to_steps" ADD CONSTRAINT "_plugins_global_v_version_seo_how_to_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_plugins_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_version_seo_speakable_css_selector" ADD CONSTRAINT "_plugins_global_v_version_seo_speakable_css_selector_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_plugins_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_version_seo_breadcrumbs" ADD CONSTRAINT "_plugins_global_v_version_seo_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_plugins_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_version_hero_animated_tags" ADD CONSTRAINT "_plugins_global_v_version_hero_animated_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_plugins_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v" ADD CONSTRAINT "_plugins_global_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v" ADD CONSTRAINT "_plugins_global_v_version_hero_button1_button_link_id_links_id_fk" FOREIGN KEY ("version_hero_button1_button_link_id") REFERENCES "public"."links"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v" ADD CONSTRAINT "_plugins_global_v_version_hero_button2_button_link_id_links_id_fk" FOREIGN KEY ("version_hero_button2_button_link_id") REFERENCES "public"."links"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v" ADD CONSTRAINT "_plugins_global_v_version_featured_section_main_plugin_id_plugins_id_fk" FOREIGN KEY ("version_featured_section_main_plugin_id") REFERENCES "public"."plugins"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_rels" ADD CONSTRAINT "_plugins_global_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_plugins_global_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_plugins_global_v_rels" ADD CONSTRAINT "_plugins_global_v_rels_plugins_fk" FOREIGN KEY ("plugins_id") REFERENCES "public"."plugins"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_blur_sizes_blur_filename_idx" ON "media" USING btree ("sizes_blur_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE UNIQUE INDEX IF NOT EXISTS "links_url_idx" ON "links" USING btree ("url");
  CREATE INDEX IF NOT EXISTS "links_updated_at_idx" ON "links" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "links_created_at_idx" ON "links" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "legal_docs_slug_idx" ON "legal_docs" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "legal_docs_updated_at_idx" ON "legal_docs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "legal_docs_created_at_idx" ON "legal_docs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "legal_docs__status_idx" ON "legal_docs" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_parent_idx" ON "_legal_docs_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_version_version_slug_idx" ON "_legal_docs_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_version_version_updated_at_idx" ON "_legal_docs_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_version_version_created_at_idx" ON "_legal_docs_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_version_version__status_idx" ON "_legal_docs_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_created_at_idx" ON "_legal_docs_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_updated_at_idx" ON "_legal_docs_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_latest_idx" ON "_legal_docs_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_legal_docs_v_autosave_idx" ON "_legal_docs_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "svgs_updated_at_idx" ON "svgs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "svgs_created_at_idx" ON "svgs" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "svgs_filename_idx" ON "svgs" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "items_image_idx" ON "items" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "items_slug_idx" ON "items" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "items_updated_at_idx" ON "items" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "items_created_at_idx" ON "items" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "items__status_idx" ON "items" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_items_v_parent_idx" ON "_items_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_items_v_version_version_image_idx" ON "_items_v" USING btree ("version_image_id");
  CREATE INDEX IF NOT EXISTS "_items_v_version_version_slug_idx" ON "_items_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_items_v_version_version_updated_at_idx" ON "_items_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_items_v_version_version_created_at_idx" ON "_items_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_items_v_version_version__status_idx" ON "_items_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_items_v_created_at_idx" ON "_items_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_items_v_updated_at_idx" ON "_items_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_items_v_latest_idx" ON "_items_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_items_v_autosave_idx" ON "_items_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "showcases_image_idx" ON "showcases" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "showcases_slug_idx" ON "showcases" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "showcases_updated_at_idx" ON "showcases" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "showcases_created_at_idx" ON "showcases" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "showcases__status_idx" ON "showcases" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_showcases_v_parent_idx" ON "_showcases_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_showcases_v_version_version_image_idx" ON "_showcases_v" USING btree ("version_image_id");
  CREATE INDEX IF NOT EXISTS "_showcases_v_version_version_slug_idx" ON "_showcases_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_showcases_v_version_version_updated_at_idx" ON "_showcases_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_showcases_v_version_version_created_at_idx" ON "_showcases_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_showcases_v_version_version__status_idx" ON "_showcases_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_showcases_v_created_at_idx" ON "_showcases_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_showcases_v_updated_at_idx" ON "_showcases_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_showcases_v_latest_idx" ON "_showcases_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_showcases_v_autosave_idx" ON "_showcases_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_idx" ON "tags" USING btree ("name");
  CREATE INDEX IF NOT EXISTS "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "plugins_install_commands_order_idx" ON "plugins_install_commands" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "plugins_install_commands_parent_id_idx" ON "plugins_install_commands" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_comments_order_idx" ON "plugins_comments" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "plugins_comments_parent_id_idx" ON "plugins_comments" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_category_idx" ON "plugins" USING btree ("category_id");
  CREATE INDEX IF NOT EXISTS "plugins_main_image_idx" ON "plugins" USING btree ("main_image_id");
  CREATE INDEX IF NOT EXISTS "plugins_slug_idx" ON "plugins" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "plugins_updated_at_idx" ON "plugins" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "plugins_created_at_idx" ON "plugins" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "plugins__status_idx" ON "plugins" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "plugins_rels_order_idx" ON "plugins_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "plugins_rels_parent_idx" ON "plugins_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_rels_path_idx" ON "plugins_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "plugins_rels_tags_id_idx" ON "plugins_rels" USING btree ("tags_id");
  CREATE INDEX IF NOT EXISTS "plugins_rels_media_id_idx" ON "plugins_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_install_commands_order_idx" ON "_plugins_v_version_install_commands" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_install_commands_parent_id_idx" ON "_plugins_v_version_install_commands" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_comments_order_idx" ON "_plugins_v_version_comments" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_comments_parent_id_idx" ON "_plugins_v_version_comments" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_parent_idx" ON "_plugins_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_version_category_idx" ON "_plugins_v" USING btree ("version_category_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_version_main_image_idx" ON "_plugins_v" USING btree ("version_main_image_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_version_slug_idx" ON "_plugins_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_version_updated_at_idx" ON "_plugins_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_version_created_at_idx" ON "_plugins_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_plugins_v_version_version__status_idx" ON "_plugins_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_plugins_v_created_at_idx" ON "_plugins_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_plugins_v_updated_at_idx" ON "_plugins_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_plugins_v_latest_idx" ON "_plugins_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_plugins_v_autosave_idx" ON "_plugins_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_plugins_v_rels_order_idx" ON "_plugins_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_plugins_v_rels_parent_idx" ON "_plugins_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_rels_path_idx" ON "_plugins_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_plugins_v_rels_tags_id_idx" ON "_plugins_v_rels" USING btree ("tags_id");
  CREATE INDEX IF NOT EXISTS "_plugins_v_rels_media_id_idx" ON "_plugins_v_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "resources_image_idx" ON "resources" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "resources_author_idx" ON "resources" USING btree ("author_id");
  CREATE INDEX IF NOT EXISTS "resources_slug_idx" ON "resources" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "resources_rels_order_idx" ON "resources_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "resources_rels_parent_idx" ON "resources_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "resources_rels_path_idx" ON "resources_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "resources_rels_tags_id_idx" ON "resources_rels" USING btree ("tags_id");
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
  CREATE UNIQUE INDEX IF NOT EXISTS "releases_version_idx" ON "releases" USING btree ("version");
  CREATE INDEX IF NOT EXISTS "releases_updated_at_idx" ON "releases" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "releases_created_at_idx" ON "releases" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "search_category_idx" ON "search" USING btree ("category_id");
  CREATE INDEX IF NOT EXISTS "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "search_rels_plugins_id_idx" ON "search_rels" USING btree ("plugins_id");
  CREATE INDEX IF NOT EXISTS "search_rels_tags_id_idx" ON "search_rels" USING btree ("tags_id");
  CREATE INDEX IF NOT EXISTS "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX IF NOT EXISTS "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX IF NOT EXISTS "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX IF NOT EXISTS "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX IF NOT EXISTS "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX IF NOT EXISTS "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX IF NOT EXISTS "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX IF NOT EXISTS "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_links_id_idx" ON "payload_locked_documents_rels" USING btree ("links_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_legal_docs_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_docs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_svgs_id_idx" ON "payload_locked_documents_rels" USING btree ("svgs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_items_id_idx" ON "payload_locked_documents_rels" USING btree ("items_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_showcases_id_idx" ON "payload_locked_documents_rels" USING btree ("showcases_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_plugins_id_idx" ON "payload_locked_documents_rels" USING btree ("plugins_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_releases_id_idx" ON "payload_locked_documents_rels" USING btree ("releases_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_jobs_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "nav_nav_links_order_idx" ON "nav_nav_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "nav_nav_links_parent_id_idx" ON "nav_nav_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_faq_order_idx" ON "contact_global_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_faq_parent_id_idx" ON "contact_global_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_how_to_steps_order_idx" ON "contact_global_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_how_to_steps_parent_id_idx" ON "contact_global_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_how_to_steps_image_idx" ON "contact_global_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_speakable_css_selector_order_idx" ON "contact_global_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_speakable_css_selector_parent_id_idx" ON "contact_global_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_breadcrumbs_order_idx" ON "contact_global_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_breadcrumbs_parent_id_idx" ON "contact_global_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "contact_global_seo_seo_og_image_idx" ON "contact_global" USING btree ("seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "contact_global__status_idx" ON "contact_global" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_faq_order_idx" ON "_contact_global_v_version_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_faq_parent_id_idx" ON "_contact_global_v_version_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_how_to_steps_order_idx" ON "_contact_global_v_version_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_how_to_steps_parent_id_idx" ON "_contact_global_v_version_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_how_to_steps_image_idx" ON "_contact_global_v_version_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_speakable_css_selector_order_idx" ON "_contact_global_v_version_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_speakable_css_selector_parent_id_idx" ON "_contact_global_v_version_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_breadcrumbs_order_idx" ON "_contact_global_v_version_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_breadcrumbs_parent_id_idx" ON "_contact_global_v_version_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_seo_version_seo_og_image_idx" ON "_contact_global_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_version_version__status_idx" ON "_contact_global_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_created_at_idx" ON "_contact_global_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_updated_at_idx" ON "_contact_global_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_latest_idx" ON "_contact_global_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_contact_global_v_autosave_idx" ON "_contact_global_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "footer_link_columns_links_order_idx" ON "footer_link_columns_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_link_columns_links_parent_id_idx" ON "footer_link_columns_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_link_columns_order_idx" ON "footer_link_columns" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_link_columns_parent_id_idx" ON "footer_link_columns" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_legal_links_document_idx" ON "footer_legal_links" USING btree ("document_id");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_faq_order_idx" ON "showcase_global_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_faq_parent_id_idx" ON "showcase_global_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_how_to_steps_order_idx" ON "showcase_global_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_how_to_steps_parent_id_idx" ON "showcase_global_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_how_to_steps_image_idx" ON "showcase_global_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_speakable_css_selector_order_idx" ON "showcase_global_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_speakable_css_selector_parent_id_idx" ON "showcase_global_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_breadcrumbs_order_idx" ON "showcase_global_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_breadcrumbs_parent_id_idx" ON "showcase_global_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "showcase_global_seo_seo_og_image_idx" ON "showcase_global" USING btree ("seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "showcase_global__status_idx" ON "showcase_global" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_faq_order_idx" ON "_showcase_global_v_version_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_faq_parent_id_idx" ON "_showcase_global_v_version_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_how_to_steps_order_idx" ON "_showcase_global_v_version_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_how_to_steps_parent_id_idx" ON "_showcase_global_v_version_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_how_to_steps_image_idx" ON "_showcase_global_v_version_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_speakable_css_selector_order_idx" ON "_showcase_global_v_version_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_speakable_css_selector_parent_id_idx" ON "_showcase_global_v_version_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_breadcrumbs_order_idx" ON "_showcase_global_v_version_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_breadcrumbs_parent_id_idx" ON "_showcase_global_v_version_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_seo_version_seo_og_image_idx" ON "_showcase_global_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_version_version__status_idx" ON "_showcase_global_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_created_at_idx" ON "_showcase_global_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_updated_at_idx" ON "_showcase_global_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_latest_idx" ON "_showcase_global_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_showcase_global_v_autosave_idx" ON "_showcase_global_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "about_global_seo_faq_order_idx" ON "about_global_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_global_seo_faq_parent_id_idx" ON "about_global_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_global_seo_how_to_steps_order_idx" ON "about_global_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_global_seo_how_to_steps_parent_id_idx" ON "about_global_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_global_seo_how_to_steps_image_idx" ON "about_global_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "about_global_seo_speakable_css_selector_order_idx" ON "about_global_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_global_seo_speakable_css_selector_parent_id_idx" ON "about_global_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_global_seo_breadcrumbs_order_idx" ON "about_global_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "about_global_seo_breadcrumbs_parent_id_idx" ON "about_global_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "about_global_seo_seo_og_image_idx" ON "about_global" USING btree ("seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "about_global__status_idx" ON "about_global" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_faq_order_idx" ON "_about_global_v_version_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_faq_parent_id_idx" ON "_about_global_v_version_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_how_to_steps_order_idx" ON "_about_global_v_version_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_how_to_steps_parent_id_idx" ON "_about_global_v_version_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_how_to_steps_image_idx" ON "_about_global_v_version_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_speakable_css_selector_order_idx" ON "_about_global_v_version_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_speakable_css_selector_parent_id_idx" ON "_about_global_v_version_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_breadcrumbs_order_idx" ON "_about_global_v_version_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_breadcrumbs_parent_id_idx" ON "_about_global_v_version_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_seo_version_seo_og_image_idx" ON "_about_global_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "_about_global_v_version_version__status_idx" ON "_about_global_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_about_global_v_created_at_idx" ON "_about_global_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_about_global_v_updated_at_idx" ON "_about_global_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_about_global_v_latest_idx" ON "_about_global_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_about_global_v_autosave_idx" ON "_about_global_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "home_global_seo_faq_order_idx" ON "home_global_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_seo_faq_parent_id_idx" ON "home_global_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_seo_how_to_steps_order_idx" ON "home_global_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_seo_how_to_steps_parent_id_idx" ON "home_global_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_seo_how_to_steps_image_idx" ON "home_global_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "home_global_seo_speakable_css_selector_order_idx" ON "home_global_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_seo_speakable_css_selector_parent_id_idx" ON "home_global_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_seo_breadcrumbs_order_idx" ON "home_global_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_seo_breadcrumbs_parent_id_idx" ON "home_global_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_explore_cards_order_idx" ON "home_global_explore_cards" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_explore_cards_parent_id_idx" ON "home_global_explore_cards" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_share_section_benefits_order_idx" ON "home_global_share_section_benefits" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_share_section_benefits_parent_id_idx" ON "home_global_share_section_benefits" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_community_section_community_links_order_idx" ON "home_global_community_section_community_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_community_section_community_links_parent_id_idx" ON "home_global_community_section_community_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_powered_by_section_tech_logos_order_idx" ON "home_global_powered_by_section_tech_logos" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "home_global_powered_by_section_tech_logos_parent_id_idx" ON "home_global_powered_by_section_tech_logos" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "home_global_powered_by_section_tech_logos_logo_image_idx" ON "home_global_powered_by_section_tech_logos" USING btree ("logo_image_id");
  CREATE INDEX IF NOT EXISTS "home_global_seo_seo_og_image_idx" ON "home_global" USING btree ("seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_faq_order_idx" ON "plugins_global_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_faq_parent_id_idx" ON "plugins_global_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_how_to_steps_order_idx" ON "plugins_global_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_how_to_steps_parent_id_idx" ON "plugins_global_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_how_to_steps_image_idx" ON "plugins_global_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_speakable_css_selector_order_idx" ON "plugins_global_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_speakable_css_selector_parent_id_idx" ON "plugins_global_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_breadcrumbs_order_idx" ON "plugins_global_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_breadcrumbs_parent_id_idx" ON "plugins_global_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_hero_animated_tags_order_idx" ON "plugins_global_hero_animated_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "plugins_global_hero_animated_tags_parent_id_idx" ON "plugins_global_hero_animated_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_seo_seo_og_image_idx" ON "plugins_global" USING btree ("seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_hero_button1_hero_button1_button_link_idx" ON "plugins_global" USING btree ("hero_button1_button_link_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_hero_button2_hero_button2_button_link_idx" ON "plugins_global" USING btree ("hero_button2_button_link_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_featured_section_featured_section_main_plugin_idx" ON "plugins_global" USING btree ("featured_section_main_plugin_id");
  CREATE INDEX IF NOT EXISTS "plugins_global__status_idx" ON "plugins_global" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "plugins_global_rels_order_idx" ON "plugins_global_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "plugins_global_rels_parent_idx" ON "plugins_global_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "plugins_global_rels_path_idx" ON "plugins_global_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "plugins_global_rels_plugins_id_idx" ON "plugins_global_rels" USING btree ("plugins_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_faq_order_idx" ON "_plugins_global_v_version_seo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_faq_parent_id_idx" ON "_plugins_global_v_version_seo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_how_to_steps_order_idx" ON "_plugins_global_v_version_seo_how_to_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_how_to_steps_parent_id_idx" ON "_plugins_global_v_version_seo_how_to_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_how_to_steps_image_idx" ON "_plugins_global_v_version_seo_how_to_steps" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_speakable_css_selector_order_idx" ON "_plugins_global_v_version_seo_speakable_css_selector" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_speakable_css_selector_parent_id_idx" ON "_plugins_global_v_version_seo_speakable_css_selector" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_breadcrumbs_order_idx" ON "_plugins_global_v_version_seo_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_breadcrumbs_parent_id_idx" ON "_plugins_global_v_version_seo_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_hero_animated_tags_order_idx" ON "_plugins_global_v_version_hero_animated_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_hero_animated_tags_parent_id_idx" ON "_plugins_global_v_version_hero_animated_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_seo_version_seo_og_image_idx" ON "_plugins_global_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_hero_button1_version_hero_button1_button_link_idx" ON "_plugins_global_v" USING btree ("version_hero_button1_button_link_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_hero_button2_version_hero_button2_button_link_idx" ON "_plugins_global_v" USING btree ("version_hero_button2_button_link_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_featured_section_version_featured_section_main_plugin_idx" ON "_plugins_global_v" USING btree ("version_featured_section_main_plugin_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_version_version__status_idx" ON "_plugins_global_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_created_at_idx" ON "_plugins_global_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_updated_at_idx" ON "_plugins_global_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_latest_idx" ON "_plugins_global_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_autosave_idx" ON "_plugins_global_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_rels_order_idx" ON "_plugins_global_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_rels_parent_idx" ON "_plugins_global_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_rels_path_idx" ON "_plugins_global_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_plugins_global_v_rels_plugins_id_idx" ON "_plugins_global_v_rels" USING btree ("plugins_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "links" CASCADE;
  DROP TABLE "legal_docs" CASCADE;
  DROP TABLE "_legal_docs_v" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "svgs" CASCADE;
  DROP TABLE "items" CASCADE;
  DROP TABLE "_items_v" CASCADE;
  DROP TABLE "showcases" CASCADE;
  DROP TABLE "_showcases_v" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "plugins_install_commands" CASCADE;
  DROP TABLE "plugins_comments" CASCADE;
  DROP TABLE "plugins" CASCADE;
  DROP TABLE "plugins_rels" CASCADE;
  DROP TABLE "_plugins_v_version_install_commands" CASCADE;
  DROP TABLE "_plugins_v_version_comments" CASCADE;
  DROP TABLE "_plugins_v" CASCADE;
  DROP TABLE "_plugins_v_rels" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "resources_rels" CASCADE;
  DROP TABLE "releases_bug_fixes" CASCADE;
  DROP TABLE "releases_features" CASCADE;
  DROP TABLE "releases_documentation" CASCADE;
  DROP TABLE "releases_tests" CASCADE;
  DROP TABLE "releases_chores" CASCADE;
  DROP TABLE "releases_contributors" CASCADE;
  DROP TABLE "releases" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "nav_nav_links" CASCADE;
  DROP TABLE "nav" CASCADE;
  DROP TABLE "contact_global_seo_faq" CASCADE;
  DROP TABLE "contact_global_seo_how_to_steps" CASCADE;
  DROP TABLE "contact_global_seo_speakable_css_selector" CASCADE;
  DROP TABLE "contact_global_seo_breadcrumbs" CASCADE;
  DROP TABLE "contact_global" CASCADE;
  DROP TABLE "_contact_global_v_version_seo_faq" CASCADE;
  DROP TABLE "_contact_global_v_version_seo_how_to_steps" CASCADE;
  DROP TABLE "_contact_global_v_version_seo_speakable_css_selector" CASCADE;
  DROP TABLE "_contact_global_v_version_seo_breadcrumbs" CASCADE;
  DROP TABLE "_contact_global_v" CASCADE;
  DROP TABLE "footer_link_columns_links" CASCADE;
  DROP TABLE "footer_link_columns" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "showcase_global_seo_faq" CASCADE;
  DROP TABLE "showcase_global_seo_how_to_steps" CASCADE;
  DROP TABLE "showcase_global_seo_speakable_css_selector" CASCADE;
  DROP TABLE "showcase_global_seo_breadcrumbs" CASCADE;
  DROP TABLE "showcase_global" CASCADE;
  DROP TABLE "_showcase_global_v_version_seo_faq" CASCADE;
  DROP TABLE "_showcase_global_v_version_seo_how_to_steps" CASCADE;
  DROP TABLE "_showcase_global_v_version_seo_speakable_css_selector" CASCADE;
  DROP TABLE "_showcase_global_v_version_seo_breadcrumbs" CASCADE;
  DROP TABLE "_showcase_global_v" CASCADE;
  DROP TABLE "about_global_seo_faq" CASCADE;
  DROP TABLE "about_global_seo_how_to_steps" CASCADE;
  DROP TABLE "about_global_seo_speakable_css_selector" CASCADE;
  DROP TABLE "about_global_seo_breadcrumbs" CASCADE;
  DROP TABLE "about_global" CASCADE;
  DROP TABLE "_about_global_v_version_seo_faq" CASCADE;
  DROP TABLE "_about_global_v_version_seo_how_to_steps" CASCADE;
  DROP TABLE "_about_global_v_version_seo_speakable_css_selector" CASCADE;
  DROP TABLE "_about_global_v_version_seo_breadcrumbs" CASCADE;
  DROP TABLE "_about_global_v" CASCADE;
  DROP TABLE "home_global_seo_faq" CASCADE;
  DROP TABLE "home_global_seo_how_to_steps" CASCADE;
  DROP TABLE "home_global_seo_speakable_css_selector" CASCADE;
  DROP TABLE "home_global_seo_breadcrumbs" CASCADE;
  DROP TABLE "home_global_explore_cards" CASCADE;
  DROP TABLE "home_global_share_section_benefits" CASCADE;
  DROP TABLE "home_global_community_section_community_links" CASCADE;
  DROP TABLE "home_global_powered_by_section_tech_logos" CASCADE;
  DROP TABLE "home_global" CASCADE;
  DROP TABLE "plugins_global_seo_faq" CASCADE;
  DROP TABLE "plugins_global_seo_how_to_steps" CASCADE;
  DROP TABLE "plugins_global_seo_speakable_css_selector" CASCADE;
  DROP TABLE "plugins_global_seo_breadcrumbs" CASCADE;
  DROP TABLE "plugins_global_hero_animated_tags" CASCADE;
  DROP TABLE "plugins_global" CASCADE;
  DROP TABLE "plugins_global_rels" CASCADE;
  DROP TABLE "_plugins_global_v_version_seo_faq" CASCADE;
  DROP TABLE "_plugins_global_v_version_seo_how_to_steps" CASCADE;
  DROP TABLE "_plugins_global_v_version_seo_speakable_css_selector" CASCADE;
  DROP TABLE "_plugins_global_v_version_seo_breadcrumbs" CASCADE;
  DROP TABLE "_plugins_global_v_version_hero_animated_tags" CASCADE;
  DROP TABLE "_plugins_global_v" CASCADE;
  DROP TABLE "_plugins_global_v_rels" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_origin";
  DROP TYPE "public"."enum_legal_docs_status";
  DROP TYPE "public"."enum__legal_docs_v_version_status";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_items_status";
  DROP TYPE "public"."enum__items_v_version_status";
  DROP TYPE "public"."enum_showcases_status";
  DROP TYPE "public"."enum__showcases_v_version_status";
  DROP TYPE "public"."enum_tags_color";
  DROP TYPE "public"."enum_plugins_install_commands_package_manager";
  DROP TYPE "public"."enum_plugins_verification_github_verification_method";
  DROP TYPE "public"."enum_plugins_status";
  DROP TYPE "public"."enum__plugins_v_version_install_commands_package_manager";
  DROP TYPE "public"."enum__plugins_v_version_verification_github_verification_method";
  DROP TYPE "public"."enum__plugins_v_version_status";
  DROP TYPE "public"."enum_resources_resource_type";
  DROP TYPE "public"."enum_resources_source";
  DROP TYPE "public"."enum_resources_source_platform";
  DROP TYPE "public"."enum_resources_difficulty";
  DROP TYPE "public"."enum_resources_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_contact_global_status";
  DROP TYPE "public"."enum__contact_global_v_version_status";
  DROP TYPE "public"."enum_showcase_global_hero_submit_button_variant";
  DROP TYPE "public"."enum_showcase_global_hero_submit_button_size";
  DROP TYPE "public"."enum_showcase_global_status";
  DROP TYPE "public"."enum__showcase_global_v_version_hero_submit_button_variant";
  DROP TYPE "public"."enum__showcase_global_v_version_hero_submit_button_size";
  DROP TYPE "public"."enum__showcase_global_v_version_status";
  DROP TYPE "public"."enum_about_global_status";
  DROP TYPE "public"."enum__about_global_v_version_status";
  DROP TYPE "public"."enum_home_global_powered_by_section_tech_logos_style";
  DROP TYPE "public"."enum_plugins_global_status";
  DROP TYPE "public"."enum__plugins_global_v_version_status";`)
}
