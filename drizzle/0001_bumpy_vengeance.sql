CREATE TABLE `document_files` (
	`id` text PRIMARY KEY NOT NULL,
	`sha256` text NOT NULL,
	`size` integer NOT NULL,
	`mime` text NOT NULL,
	`storage_key` text NOT NULL,
	`state` text DEFAULT 'uploading' NOT NULL,
	`upload_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "document_file_size" CHECK("document_files"."size">0 AND "document_files"."size"<=209715200),
	CONSTRAINT "document_file_state" CHECK("document_files"."state" IN ('uploading','ready','cancelled'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_files_sha256_unique` ON `document_files` (`sha256`);--> statement-breakpoint
CREATE UNIQUE INDEX `document_files_storage_key_unique` ON `document_files` (`storage_key`);--> statement-breakpoint
CREATE TABLE `document_pages` (
	`version_id` text NOT NULL,
	`number` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `document_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_page_number` ON `document_pages` (`version_id`,`number`);--> statement-breakpoint
CREATE TABLE `document_parts` (
	`file_id` text NOT NULL,
	`number` integer NOT NULL,
	`etag` text NOT NULL,
	`size` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `document_files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_part_number` ON `document_parts` (`file_id`,`number`);--> statement-breakpoint
CREATE TABLE `document_product_links` (
	`version_id` text NOT NULL,
	`product_id` text NOT NULL,
	`page_from` integer NOT NULL,
	`page_to` integer NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `document_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_product_version` ON `document_product_links` (`version_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `document_product_lookup` ON `document_product_links` (`product_id`);--> statement-breakpoint
CREATE TABLE `document_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`file_id` text NOT NULL,
	`number` integer NOT NULL,
	`filename` text NOT NULL,
	`page_count` integer DEFAULT 0 NOT NULL,
	`text_status` text DEFAULT 'pending' NOT NULL,
	`approved` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`file_id`) REFERENCES `document_files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_version_number` ON `document_versions` (`document_id`,`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `document_version_file` ON `document_versions` (`document_id`,`file_id`);--> statement-breakpoint
CREATE INDEX `document_versions_file` ON `document_versions` (`file_id`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`audience` text DEFAULT 'internal' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`current_version_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "documents_category" CHECK("documents"."category" IN ('technical','catalog','training','business','other')),
	CONSTRAINT "documents_audience" CHECK("documents"."audience" IN ('internal','advisors','clients')),
	CONSTRAINT "documents_status" CHECK("documents"."status" IN ('pending','current','archived'))
);
--> statement-breakpoint
CREATE INDEX `documents_visibility` ON `documents` (`status`,`audience`);