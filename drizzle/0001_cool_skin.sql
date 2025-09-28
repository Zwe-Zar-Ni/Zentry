CREATE TABLE `currencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`native_name` text NOT NULL,
	`key` text NOT NULL,
	`flag` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `language_id` integer DEFAULT 1 REFERENCES languages(id);--> statement-breakpoint
ALTER TABLE `users` ADD `currency_id` integer DEFAULT 1 REFERENCES currencies(id);--> statement-breakpoint
ALTER TABLE `users` ADD `dark_mode` integer DEFAULT 0;