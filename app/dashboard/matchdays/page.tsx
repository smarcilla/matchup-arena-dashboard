'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/contexts/DashboardContext';
import { LoadingPage, StatusBadge, ConfirmDialog } from '@/components';

export default function MatchdaysPage() {
  const { state, loading, error, deleteMatchday } = useDashboard();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'ready' | 'published'>('all');

  if (loading) {
    return <LoadingPage message="Loading matchdays..." />;
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

  const matchdays = state?.matchdays
    .filter((m) => filter === 'all' || m.status === filter)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) || [];

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMatchday(deleteId);
      setDeleteId(null);
    }
  };

  const getCompetitionName = (competitionId: string) => {
    return state?.competitions.find((c) => c.id === competitionId)?.name || 'Unknown';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Matchdays</h1>
          <p className="text-zinc-400">
            View and manage all matchdays across competitions.
          </p>
        </div>
        <Link
          href="/dashboard/matchdays/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
        >
          <span>+</span>
          New Matchday
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'draft', 'ready', 'published'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-2 text-sm opacity-75">
                ({state?.matchdays.filter((m) => m.status === status).length || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {matchdays.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <span className="text-6xl mb-4 block">📅</span>
          <h2 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'No matchdays yet' : `No ${filter} matchdays`}
          </h2>
          <p className="text-zinc-400 mb-6">
            {filter === 'all'
              ? 'Create your first matchday to get started.'
              : 'No matchdays with this status.'}
          </p>
          {filter === 'all' && (
            <Link
              href="/dashboard/matchdays/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              <span>+</span>
              Create Matchday
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Competition
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Matchday
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Players
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                  Updated
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {matchdays.map((matchday) => (
                <tr key={matchday.id} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <span className="text-white">
                      {getCompetitionName(matchday.competitionId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/dashboard/matchdays/${matchday.id}`}
                      className="text-white font-medium hover:text-blue-400 transition"
                    >
                      #{matchday.matchday}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-300">
                    {matchday.players.length}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={matchday.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {new Date(matchday.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/matchdays/${matchday.id}`}
                        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(matchday.id)}
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
        title="Delete Matchday"
        message="Are you sure you want to delete this matchday? All players will be removed. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
