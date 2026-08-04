-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "created_by" TEXT;

-- CreateIndex
CREATE INDEX "sales_created_by_idx" ON "sales"("created_by");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
