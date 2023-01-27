/*
  Warnings:

  - Added the required column `usersId` to the `Categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usersId` to the `Tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `usersId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `tags` ADD COLUMN `usersId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Categories` ADD CONSTRAINT `Categories_usersId_fkey` FOREIGN KEY (`usersId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tags` ADD CONSTRAINT `Tags_usersId_fkey` FOREIGN KEY (`usersId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
