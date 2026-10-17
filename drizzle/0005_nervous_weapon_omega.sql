CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`period` text DEFAULT '' NOT NULL,
	`products` text DEFAULT '[]' NOT NULL,
	`permission` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`search_text` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "story_status" CHECK("stories"."status" IN ('draft','published','archived')),
	CONSTRAINT "story_permission" CHECK("stories"."permission" IN (0,1)),
	CONSTRAINT "story_products_json" CHECK(json_valid("stories"."products"))
);
--> statement-breakpoint
CREATE INDEX `stories_status_date` ON `stories` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `story_media` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`kind` text NOT NULL,
	`url` text,
	`file_id` text,
	`caption` text DEFAULT '' NOT NULL,
	`removed` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`file_id`) REFERENCES `document_files`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "story_media_kind" CHECK("story_media"."kind" IN ('image','video','link')),
	CONSTRAINT "story_media_removed" CHECK("story_media"."removed" IN (0,1)),
	CONSTRAINT "story_media_source" CHECK(("story_media"."kind"='link' AND "story_media"."url" IS NOT NULL AND "story_media"."file_id" IS NULL) OR ("story_media"."kind" IN ('image','video') AND "story_media"."file_id" IS NOT NULL AND "story_media"."url" IS NULL))
);
--> statement-breakpoint
CREATE INDEX `story_media_lookup` ON `story_media` (`story_id`,`removed`);--> statement-breakpoint
CREATE UNIQUE INDEX `story_media_file` ON `story_media` (`story_id`,`file_id`);