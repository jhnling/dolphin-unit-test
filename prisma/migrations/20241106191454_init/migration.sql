-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "unitTests" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Problem_uuid_key" ON "Problem"("uuid");
