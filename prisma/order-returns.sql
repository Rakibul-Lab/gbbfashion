-- Exchange & Return tables for delivered orders (safe to re-run: ignores duplicates)

CREATE TABLE IF NOT EXISTS `OrderReturn` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
  `reason` TEXT NULL,
  `notes` TEXT NULL,
  `refundAmount` DOUBLE NOT NULL DEFAULT 0,
  `restocked` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `OrderReturn_orderId_idx`(`orderId`),
  INDEX `OrderReturn_type_idx`(`type`),
  INDEX `OrderReturn_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrderReturnItem` (
  `id` VARCHAR(191) NOT NULL,
  `returnId` VARCHAR(191) NOT NULL,
  `orderItemId` VARCHAR(191) NOT NULL,
  `quantity` INTEGER NOT NULL,
  `productId` VARCHAR(191) NULL,
  `productName` VARCHAR(191) NOT NULL,
  `unitPrice` DOUBLE NOT NULL DEFAULT 0,
  `exchangeUnitPrice` DOUBLE NULL,
  `exchangeProductName` VARCHAR(191) NULL,
  `exchangeColor` VARCHAR(191) NULL,
  `exchangeSize` VARCHAR(191) NULL,
  INDEX `OrderReturnItem_returnId_idx`(`returnId`),
  INDEX `OrderReturnItem_orderItemId_idx`(`orderItemId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign keys (ignore if already present)
-- ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE `OrderReturnItem` ADD CONSTRAINT `OrderReturnItem_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `OrderReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add exchange unit price column if upgrading an existing table
-- ALTER TABLE `OrderReturnItem` ADD COLUMN `exchangeUnitPrice` DOUBLE NULL;
