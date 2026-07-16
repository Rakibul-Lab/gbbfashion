-- Add product URL slug (from featured image name when possible).
-- Run once on MySQL / MariaDB / cPanel if the column is missing.

ALTER TABLE `Product`
  ADD COLUMN `slug` VARCHAR(191) NULL AFTER `name`;

-- Temporary unique values so we can make the column NOT NULL.
UPDATE `Product`
SET `slug` = CONCAT('product-', `id`)
WHERE `slug` IS NULL OR `slug` = '';

ALTER TABLE `Product`
  MODIFY COLUMN `slug` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `Product_slug_key` ON `Product`(`slug`);
