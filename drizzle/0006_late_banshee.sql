CREATE TABLE `contribution_files` (
	`id` text PRIMARY KEY NOT NULL,
	`contribution_id` text NOT NULL,
	`kind` text NOT NULL,
	`file_id` text,
	`url` text,
	`filename` text DEFAULT '' NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`removed` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`file_id`) REFERENCES `document_files`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "contribution_file_kind" CHECK("contribution_files"."kind" IN ('image','video','document','link')),
	CONSTRAINT "contribution_file_source" CHECK(("contribution_files"."kind"='link' AND "contribution_files"."file_id" IS NULL AND "contribution_files"."url" IS NOT NULL) OR ("contribution_files"."kind"!='link' AND "contribution_files"."file_id" IS NOT NULL AND "contribution_files"."url" IS NULL))
);
--> statement-breakpoint
CREATE INDEX `contribution_files_parent` ON `contribution_files` (`contribution_id`,`removed`);--> statement-breakpoint
CREATE UNIQUE INDEX `contribution_file_unique` ON `contribution_files` (`contribution_id`,`file_id`);--> statement-breakpoint
CREATE TABLE `contribution_pages` (
	`contribution_id` text NOT NULL,
	`number` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contribution_page_number` ON `contribution_pages` (`contribution_id`,`number`);--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`advisor_id` integer NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`author` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`period` text DEFAULT '' NOT NULL,
	`products` text DEFAULT '[]' NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`permission` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`review_note` text DEFAULT '' NOT NULL,
	`output_id` text,
	`page_count` integer DEFAULT 0 NOT NULL,
	`text_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`advisor_id`) REFERENCES `advisors`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "contribution_kind" CHECK("contributions"."kind" IN ('story','document')),
	CONSTRAINT "contribution_state" CHECK("contributions"."state" IN ('draft','pending','changes_requested','rejected','approved')),
	CONSTRAINT "contribution_permission" CHECK("contributions"."permission" IN (0,1)),
	CONSTRAINT "contribution_products" CHECK(json_valid("contributions"."products"))
);
--> statement-breakpoint
CREATE INDEX `contributions_owner` ON `contributions` (`advisor_id`,`state`);--> statement-breakpoint
CREATE INDEX `contributions_review` ON `contributions` (`state`,`created_at`);