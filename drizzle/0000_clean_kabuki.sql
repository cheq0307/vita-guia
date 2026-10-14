CREATE TABLE `access_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`advisor_id` integer,
	`recipient_name` text NOT NULL,
	`recipient_contact` text DEFAULT '' NOT NULL,
	`expires_at` text NOT NULL,
	`max_opens` integer,
	`open_count` integer DEFAULT 0 NOT NULL,
	`first_opened_at` text,
	`last_opened_at` text,
	`revoked` integer DEFAULT 0 NOT NULL,
	`created_by` text DEFAULT 'admin' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`advisor_id`) REFERENCES `advisors`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "link_open_count" CHECK("access_links"."open_count" >= 0),
	CONSTRAINT "link_max_opens" CHECK("access_links"."max_opens" IS NULL OR "access_links"."max_opens" > 0),
	CONSTRAINT "link_revoked" CHECK("access_links"."revoked" IN (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_links_token_unique` ON `access_links` (`token`);--> statement-breakpoint
CREATE INDEX `idx_access_links_expires_at` ON `access_links` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_access_links_advisor_id` ON `access_links` (`advisor_id`);--> statement-breakpoint
CREATE TABLE `advisors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`token` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "advisor_active" CHECK("advisors"."active" IN (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `advisors_token_unique` ON `advisors` (`token`);