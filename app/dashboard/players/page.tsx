'use client';

import { useDashboard } from '@/contexts/DashboardContext';
import { LoadingPage } from '@/components';
import Link from 'next/link';
import type { DraftPlayer, DraftMatchday, DraftCompetition } from '@/lib/types';

export default function PlayersPage() {
  const { state, loading, error } = useDashboard();

  if (loading) {
    return <LoadingPage message="Loading players..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-6">
          <h2 className="text-red-300 font-semibold mb-2">Error</h2>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  // Collect all players from all matchdays
  const allPlayers: Array<{
    player: DraftPlayer;
    matchday: DraftMatchday;
    competition: DraftCompetition | undefined;
  }> = [];

  state?.matchdays.forEach((matchday) => {
    const competition = state.competitions.find(
      (c) => c.id === matchday.competitionId
    );
    matchday.players.forEach((player) => {
      allPlayers.push({ player, matchday, competition });
    });
  });

  // Sort by competition, then matchday, then ranking
  allPlayers.sort((a, b) => {
    const compA = a.competition?.name || '';
    const compB = b.competition?.name || '';
    if (compA !== compB) return compA.localeCompare(compB);
    if (a.matchday.matchday !== b.matchday.matchday)
      return a.matchday.matchday - b.matchday.matchday;
    return a.player.ranking - b.player.ranking;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">All Players</h1>
        <p className="text-zinc-400">
          View all players across all competitions and matchdays. Total: {allPlayers.length} players.
        </p>
      </div>

      {allPlayers.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <span className="text-6xl mb-4 block">👤</span>
          <h2 className="text-xl font-semibold text-white mb-2">
            No players yet
          </h2>
          <p className="text-zinc-400 mb-6">
            Create a matchday and add players to see them here.
          </p>
          <Link
            href="/dashboard/matchdays/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <span>+</span>
            Create Matchday
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Name
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Ranking
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Competition
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Matchday
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Image Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {allPlayers.map(({ player, matchday, competition }) => (
                <tr key={`${matchday.id}-${player.id}`} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                        <span className="text-zinc-400 text-xs">?</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{player.name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-zinc-300">#{player.ranking}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">
                      {competition?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-zinc-300">#{matchday.matchday}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {player.imageUploaded ? (
                      <span className="text-green-400 text-sm">✓ Uploaded</span>
                    ) : (
                      <span className="text-yellow-400 text-sm">⚠ Missing</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/matchdays/${matchday.id}`}
                      className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition inline-block"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
