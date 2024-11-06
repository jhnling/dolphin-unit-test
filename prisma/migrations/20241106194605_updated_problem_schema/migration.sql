/*
  Warnings:

  - You are about to drop the column `unitTests` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Problem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uid]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tests` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thought` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Problem_uuid_key";

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "unitTests",
DROP COLUMN "uuid",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "prompt" TEXT NOT NULL,
ADD COLUMN     "tests" JSONB NOT NULL,
ADD COLUMN     "thought" TEXT NOT NULL,
ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Problem_uid_key" ON "Problem"("uid");
