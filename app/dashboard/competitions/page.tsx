'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/contexts/DashboardContext';
import { LoadingPage, ConfirmDialog } from '@/components';

export default function CompetitionsPage() {
  const { state, loading, error, deleteCompetition } = useDashboard();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <LoadingPage message="Loading competitions..." />;
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

  const competitions = state?.competitions || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    try {
      await deleteCompetition(deleteId);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getMatchdayCount = (competitionId: string) => {
    return state?.matchdays.filter((m) => m.competitionId === competitionId).length || 0;
  };

  const getPlayerCount = (competitionId: string) => {
    return state?.matchdays
      .filter((m) => m.competitionId === competitionId)
      .reduce((acc, m) => acc + m.players.length, 0) || 0;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Competitions</h1>
          <p className="text-zinc-400">
            Manage your competitions. Each competition can have multiple matchdays.
          </p>
        </div>
        <Link
          href="/dashboard/competitions/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
        >
          <span>+</span>
          New Competition
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <span className="text-6xl mb-4 block">🏆</span>
          <h2 className="text-xl font-semibold text-white mb-2">
            No competitions yet
          </h2>
          <p className="text-zinc-400 mb-6">
            Create your first competition to get started.
          </p>
          <Link
            href="/dashboard/competitions/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <span>+</span>
            Create Competition
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Slug
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Matchdays
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Players
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {competitions.map((competition) => (
                <tr key={competition.id} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/competitions/${competition.id}`}
                      className="text-white font-medium hover:text-blue-400 transition"
                    >
                      {competition.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 text-sm">
                      {competition.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-300">
                    {getMatchdayCount(competition.id)}
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-300">
                    {getPlayerCount(competition.id)}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(competition.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/competitions/${competition.id}`}
                        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(competition.id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Competition"
        message="Are you sure you want to delete this competition? This will also delete all associated matchdays and players. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
