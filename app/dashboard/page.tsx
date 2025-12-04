'use client';

import { useDashboard } from '@/contexts/DashboardContext';
import { LoadingPage } from '@/components';
import Link from 'next/link';

export default function DashboardHome() {
  const { state, loading, error } = useDashboard();

  if (loading) {
    return <LoadingPage message="Loading dashboard..." />;
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

  const totalCompetitions = state?.competitions.length || 0;
  const totalMatchdays = state?.matchdays.length || 0;
  const draftMatchdays = state?.matchdays.filter((m) => m.status === 'draft').length || 0;
  const publishedMatchdays = state?.matchdays.filter((m) => m.status === 'published').length || 0;
  const totalPlayers = state?.matchdays.reduce((acc, m) => acc + m.players.length, 0) || 0;

  const recentMatchdays = state?.matchdays
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5) || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">
          Welcome to Matchup Arena Dashboard. Manage your competitions, matchdays, and players.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="🏆"
          label="Competitions"
          value={totalCompetitions}
          href="/dashboard/competitions"
        />
        <StatCard
          icon="📅"
          label="Total Matchdays"
          value={totalMatchdays}
          href="/dashboard/matchdays"
        />
        <StatCard
          icon="📝"
          label="Drafts"
          value={draftMatchdays}
          color="yellow"
        />
        <StatCard
          icon="🚀"
          label="Published"
          value={publishedMatchdays}
          color="green"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Recent Matchdays
          </h2>
          
          {recentMatchdays.length === 0 ? (
            <p className="text-zinc-400 text-sm">No matchdays yet. Create your first matchday!</p>
          ) : (
            <div className="space-y-3">
              {recentMatchdays.map((matchday) => {
                const competition = state?.competitions.find(
                  (c) => c.id === matchday.competitionId
                );
                return (
                  <Link
                    key={matchday.id}
                    href={`/dashboard/matchdays/${matchday.id}`}
                    className="block p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {competition?.name || 'Unknown'} - Matchday {matchday.matchday}
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {matchday.players.length} players
                        </p>
                      </div>
                      <StatusIndicator status={matchday.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          
          <div className="space-y-3">
            <Link
              href="/dashboard/competitions/new"
              className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 rounded-lg transition"
            >
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-white font-medium">New Competition</p>
                <p className="text-blue-300 text-sm">Create a new competition</p>
              </div>
            </Link>

            <Link
              href="/dashboard/matchdays/new"
              className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 rounded-lg transition"
            >
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-white font-medium">New Matchday</p>
                <p className="text-green-300 text-sm">Add a matchday to a competition</p>
              </div>
            </Link>

            <Link
              href="/dashboard/files"
              className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/50 rounded-lg transition"
            >
              <span className="text-2xl">📁</span>
              <div>
                <p className="text-white font-medium">Browse Files</p>
                <p className="text-purple-300 text-sm">View files in Blob storage</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Total Players */}
      <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm">Total Players Across All Matchdays</p>
            <p className="text-3xl font-bold text-white">{totalPlayers}</p>
          </div>
          <Link
            href="/dashboard/players"
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
          >
            View All Players
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  color = 'blue',
}: {
  icon: string;
  label: string;
  value: number;
  href?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-600/30',
    green: 'from-green-600/20 to-green-600/5 border-green-600/30',
    yellow: 'from-yellow-600/20 to-yellow-600/5 border-yellow-600/30',
    red: 'from-red-600/20 to-red-600/5 border-red-600/30',
  };

  const content = (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 ${
        href ? 'hover:scale-[1.02] transition-transform cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <p className="text-zinc-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function StatusIndicator({ status }: { status: 'draft' | 'ready' | 'published' }) {
  const colors = {
    draft: 'bg-yellow-500',
    ready: 'bg-blue-500',
    published: 'bg-green-500',
  };

  return (
    <span
      className={`w-2 h-2 rounded-full ${colors[status]}`}
      title={status}
    />
  );
}
