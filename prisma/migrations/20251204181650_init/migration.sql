-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchdays" (
    "id" TEXT NOT NULL,
    "matchday" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "matchdays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageUploaded" BOOLEAN NOT NULL DEFAULT false,
    "ranking" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "matchdayId" TEXT NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competitions_slug_key" ON "competitions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "matchdays_competitionId_matchday_key" ON "matchdays"("competitionId", "matchday");

-- CreateIndex
CREATE UNIQUE INDEX "players_matchdayId_ranking_key" ON "players"("matchdayId", "ranking");

-- AddForeignKey
ALTER TABLE "matchdays" ADD CONSTRAINT "matchdays_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_matchdayId_fkey" FOREIGN KEY ("matchdayId") REFERENCES "matchdays"("id") ON DELETE CASCADE ON UPDATE CASCADE;
