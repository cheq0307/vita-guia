CREATE TABLE `access_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_contact` text DEFAULT '' NOT NULL,
	`expires_at` text NOT NULL,
	`max_opens` integer,
	`open_count` integer DEFAULT 0 NOT NULL,
	`first_opened_at` text,
	`last_opened_at` text,
	`revoked` integer DEFAULT false NOT NULL,
	`created_by` text DEFAULT 'local-admin' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_links_token_unique` ON `access_links` (`token`);
--> statement-breakpoint
CREATE INDEX `idx_access_links_expires_at` ON `access_links` (`expires_at`);
