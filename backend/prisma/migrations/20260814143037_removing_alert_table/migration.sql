/*
  Warnings:

  - You are about to drop the `Alerts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alerts" DROP CONSTRAINT "Alerts_patientId_fkey";

-- DropTable
DROP TABLE "Alerts";

-- DropEnum
DROP TYPE "AlertLevel";
