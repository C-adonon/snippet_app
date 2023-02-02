-- DropForeignKey
ALTER TABLE `snippets` DROP FOREIGN KEY `Snippets_categoriesId_fkey`;

-- AlterTable
ALTER TABLE `snippets` MODIFY `categoriesId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Snippets` ADD CONSTRAINT `Snippets_categoriesId_fkey` FOREIGN KEY (`categoriesId`) REFERENCES `Categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
