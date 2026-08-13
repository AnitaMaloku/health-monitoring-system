-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "Alerts" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "level" "AlertLevel" NOT NULL,
    "metric" TEXT,
    "value" DECIMAL(10,2),
    "message" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alerts_patientId_idx" ON "Alerts"("patientId");

-- CreateIndex
CREATE INDEX "Alerts_level_idx" ON "Alerts"("level");

-- CreateIndex
CREATE INDEX "Alerts_createdAt_idx" ON "Alerts"("createdAt");

-- AddForeignKey
ALTER TABLE "Alerts" ADD CONSTRAINT "Alerts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
