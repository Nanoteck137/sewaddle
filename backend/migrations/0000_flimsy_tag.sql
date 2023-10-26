CREATE TABLE `chapters` (
	`index` integer NOT NULL,
	`name` text NOT NULL,
	`mangaId` text NOT NULL,
	`cover` text NOT NULL,
	`pages` text NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`index`, `mangaId`),
	FOREIGN KEY (`mangaId`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mangas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`anilistId` integer,
	`malId` integer,
	`description` text,
	`color` text,
	`cover` text NOT NULL,
	`available` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `serverConifg` (
	`id` integer PRIMARY KEY DEFAULT 0 NOT NULL,
	`owner` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userBookmarks` (
	`userId` text NOT NULL,
	`mangaId` text NOT NULL,
	`chapterIndex` integer NOT NULL,
	`page` integer NOT NULL,
	PRIMARY KEY(`mangaId`, `userId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mangaId`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mangaId`,`chapterIndex`) REFERENCES `chapters`(`mangaId`,`index`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userChapterMarked` (
	`userId` text NOT NULL,
	`mangaId` text NOT NULL,
	`index` integer NOT NULL,
	PRIMARY KEY(`index`, `mangaId`, `userId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mangaId`,`index`) REFERENCES `chapters`(`mangaId`,`index`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userSavedMangas` (
	`userId` text NOT NULL,
	`mangaId` text NOT NULL,
	PRIMARY KEY(`mangaId`, `userId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mangaId`) REFERENCES `mangas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`isAdmin` integer DEFAULT false
);
--> statement-breakpoint
CREATE UNIQUE INDEX `anilistIndex` ON `mangas` (`anilistId`);--> statement-breakpoint
CREATE UNIQUE INDEX `malIndex` ON `mangas` (`malId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);