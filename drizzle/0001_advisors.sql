CREATE TABLE `advisors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`token` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `advisors_token_unique` ON `advisors` (`token`);
--> statement-breakpoint
ALTER TABLE `access_links` ADD `advisor_id` integer REFERENCES advisors(id);
--> statement-breakpoint
CREATE INDEX `idx_access_links_advisor_id` ON `access_links` (`advisor_id`);
