"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// COMPETITION ACTIONS
// =============================================================================

export async function getCompetitions() {
  return prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      matchdays: {
        include: {
          players: true,
        },
      },
    },
  });
}

export async function getCompetition(id: string) {
  return prisma.competition.findUnique({
    where: { id },
    include: {
      matchdays: {
        include: {
          players: true,
        },
        orderBy: { matchday: "desc" },
      },
    },
  });
}

export async function createCompetition(data: { name: string; slug: string }) {
  const competition = await prisma.competition.create({
    data: {
      name: data.name,
      slug: data.slug,
    },
  });
  revalidatePath("/dashboard/competitions");
  return competition;
}

export async function updateCompetition(
  id: string,
  data: { name?: string; slug?: string }
) {
  const competition = await prisma.competition.update({
    where: { id },
    data,
  });
  revalidatePath("/dashboard/competitions");
  revalidatePath(`/dashboard/competitions/${id}`);
  return competition;
}

export async function deleteCompetition(id: string) {
  await prisma.competition.delete({
    where: { id },
  });
  revalidatePath("/dashboard/competitions");
}

// =============================================================================
// MATCHDAY ACTIONS
// =============================================================================

export async function getMatchdays() {
  return prisma.matchday.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      competition: true,
      players: true,
    },
  });
}

export async function getMatchday(id: string) {
  return prisma.matchday.findUnique({
    where: { id },
    include: {
      competition: true,
      players: {
        orderBy: { ranking: "asc" },
      },
    },
  });
}

export async function createMatchday(data: {
  competitionId: string;
  matchday: number;
}) {
  const matchday = await prisma.matchday.create({
    data: {
      competitionId: data.competitionId,
      matchday: data.matchday,
      status: "draft",
    },
    include: {
      competition: true,
      players: true,
    },
  });
  revalidatePath("/dashboard/matchdays");
  return matchday;
}

export async function updateMatchday(
  id: string,
  data: { status?: string; matchday?: number }
) {
  const matchday = await prisma.matchday.update({
    where: { id },
    data,
  });
  revalidatePath("/dashboard/matchdays");
  revalidatePath(`/dashboard/matchdays/${id}`);
  return matchday;
}

export async function deleteMatchday(id: string) {
  await prisma.matchday.delete({
    where: { id },
  });
  revalidatePath("/dashboard/matchdays");
}

// =============================================================================
// PLAYER ACTIONS
// =============================================================================

export async function getPlayers(matchdayId: string) {
  return prisma.player.findMany({
    where: { matchdayId },
    orderBy: { ranking: "asc" },
  });
}

export async function createPlayer(data: {
  matchdayId: string;
  name: string;
  image: string;
  imageUploaded: boolean;
  ranking: number;
}) {
  const player = await prisma.player.create({
    data: {
      matchdayId: data.matchdayId,
      name: data.name,
      image: data.image,
      imageUploaded: data.imageUploaded,
      ranking: data.ranking,
    },
  });
  revalidatePath(`/dashboard/matchdays/${data.matchdayId}`);
  revalidatePath("/dashboard/players");
  return player;
}

export async function updatePlayer(
  id: string,
  data: {
    name?: string;
    image?: string;
    imageUploaded?: boolean;
    ranking?: number;
  }
) {
  const player = await prisma.player.update({
    where: { id },
    data,
  });
  revalidatePath(`/dashboard/matchdays/${player.matchdayId}`);
  revalidatePath("/dashboard/players");
  return player;
}

export async function deletePlayer(id: string) {
  const player = await prisma.player.delete({
    where: { id },
  });
  revalidatePath(`/dashboard/matchdays/${player.matchdayId}`);
  revalidatePath("/dashboard/players");
}

// =============================================================================
// PUBLISH ACTION
// =============================================================================

export async function publishMatchday(matchdayId: string) {
  const matchday = await prisma.matchday.findUnique({
    where: { id: matchdayId },
    include: {
      competition: true,
      players: true,
    },
  });

  if (!matchday) {
    return { success: false, error: "Matchday not found" };
  }

  if (matchday.players.length === 0) {
    return { success: false, error: "Matchday must have at least one player" };
  }

  const playersWithoutImage = matchday.players.filter(
    (p: { imageUploaded: boolean }) => !p.imageUploaded
  );
  if (playersWithoutImage.length > 0) {
    return {
      success: false,
      error: `${playersWithoutImage.length} player(s) have images not uploaded`,
    };
  }

  const playersWithEmptyName = matchday.players.filter(
    (p: { name: string }) => !p.name || p.name.trim() === ""
  );
  if (playersWithEmptyName.length > 0) {
    return {
      success: false,
      error: `${playersWithEmptyName.length} player(s) have empty names`,
    };
  }

  // Check unique rankings
  const rankings = matchday.players.map((p: { ranking: number }) => p.ranking);
  const uniqueRankings = new Set(rankings);
  if (rankings.length !== uniqueRankings.size) {
    return { success: false, error: "All players must have unique rankings" };
  }

  await prisma.matchday.update({
    where: { id: matchdayId },
    data: { status: "published" },
  });

  revalidatePath("/dashboard/matchdays");
  revalidatePath(`/dashboard/matchdays/${matchdayId}`);

  return { success: true };
}

// =============================================================================
// DASHBOARD STATE (for compatibility with existing UI)
// =============================================================================

type CompetitionRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

type PlayerRecord = {
  id: string;
  name: string;
  image: string;
  imageUploaded: boolean;
  ranking: number;
};

type MatchdayRecord = {
  id: string;
  competitionId: string;
  matchday: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  players: PlayerRecord[];
};

export async function getDashboardState() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
  });

  const matchdays = await prisma.matchday.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      players: {
        orderBy: { ranking: "asc" },
      },
    },
  });

  return {
    competitions: competitions.map((c: CompetitionRecord) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    matchdays: matchdays.map((m: MatchdayRecord) => ({
      id: m.id,
      competitionId: m.competitionId,
      matchday: m.matchday,
      status: m.status as "draft" | "ready" | "published",
      players: m.players.map((p: PlayerRecord) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        imageUploaded: p.imageUploaded,
        ranking: p.ranking,
      })),
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
    lastUpdated: new Date().toISOString(),
  };
}
