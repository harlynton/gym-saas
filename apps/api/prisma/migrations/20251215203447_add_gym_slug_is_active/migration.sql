/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Gym` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Gym` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Gym_slug_key" ON "Gym"("slug");
