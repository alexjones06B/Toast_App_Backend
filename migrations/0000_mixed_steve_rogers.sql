CREATE TABLE `toasts` (
	`toastID` text PRIMARY KEY NOT NULL,
	`toasterID` text NOT NULL,
	`toastieID` text NOT NULL,
	`toastTime` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`toasterID`) REFERENCES `users`(`userID`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`toastieID`) REFERENCES `users`(`userID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`userID` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
