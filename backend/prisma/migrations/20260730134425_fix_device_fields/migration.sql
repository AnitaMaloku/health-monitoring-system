/*
  Warnings:

  - You are about to drop the column `deviceCode` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `PatientDevice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serialNumber` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Device_deviceCode_key";

-- DropIndex
DROP INDEX "PatientDevice_isActive_idx";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "deviceCode",
ADD COLUMN     "serialNumber" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'INACTIVE';

-- AlterTable
ALTER TABLE "PatientDevice" DROP COLUMN "isActive";

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "Device"("serialNumber");
