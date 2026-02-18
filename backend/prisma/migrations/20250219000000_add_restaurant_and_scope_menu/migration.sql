-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN "restaurantId" TEXT,
ADD COLUMN "orderIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN "restaurantId" TEXT;

-- CreateIndex (optional, for FK lookups)
CREATE INDEX "MenuCategory_restaurantId_idx" ON "MenuCategory"("restaurantId");
CREATE INDEX "MenuItem_restaurantId_idx" ON "MenuItem"("restaurantId");

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
