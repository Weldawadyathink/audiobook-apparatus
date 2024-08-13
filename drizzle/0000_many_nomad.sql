CREATE TABLE `book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asin` text,
	`status` text DEFAULT 'Not Downloaded',
	`filename` text,
	`source` text,
	`title` text,
	`imageUrl` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_asin_unique` ON `book` (`asin`);