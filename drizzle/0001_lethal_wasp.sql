CREATE TABLE `book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asin` text,
	`status` text DEFAULT 'Not Downloaded',
	`filename` text,
	`source` text,
	`title` text,
	`imageUrl` text,
	`downloadPercentage` integer,
	`downloadSpeed` text,
	`isDownloadable` integer,
	`language` text,
	`runtimeLengthMinutes` text,
	`author` text,
	`narrator` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_asin_unique` ON `book` (`asin`);