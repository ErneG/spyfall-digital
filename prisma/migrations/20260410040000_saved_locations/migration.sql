-- CreateTable
CREATE TABLE "SavedLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "allSpies" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedLocationRole" (
    "id" TEXT NOT NULL,
    "savedLocationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SavedLocationRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedLocation_userId_idx" ON "SavedLocation"("userId");

-- CreateIndex
CREATE INDEX "SavedLocation_userId_updatedAt_idx" ON "SavedLocation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "SavedLocationRole_savedLocationId_idx" ON "SavedLocationRole"("savedLocationId");

-- CreateIndex
CREATE INDEX "SavedLocationRole_savedLocationId_order_idx" ON "SavedLocationRole"("savedLocationId", "order");

-- AddForeignKey
ALTER TABLE "SavedLocation" ADD CONSTRAINT "SavedLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedLocationRole" ADD CONSTRAINT "SavedLocationRole_savedLocationId_fkey" FOREIGN KEY ("savedLocationId") REFERENCES "SavedLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
