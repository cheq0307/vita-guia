CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`search_text` text DEFAULT '' NOT NULL,
	`kind` text NOT NULL,
	`url` text,
	`file_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `document_files`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "video_kind" CHECK("videos"."kind" IN ('file','link')),
	CONSTRAINT "video_status" CHECK("videos"."status" IN ('draft','published','archived')),
	CONSTRAINT "video_source" CHECK(("videos"."kind"='file' AND "videos"."file_id" IS NOT NULL AND "videos"."url" IS NULL) OR ("videos"."kind"='link' AND "videos"."url" IS NOT NULL AND "videos"."file_id" IS NULL))
);
--> statement-breakpoint
CREATE INDEX `videos_status_date` ON `videos` (`status`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `videos_file` ON `videos` (`file_id`);