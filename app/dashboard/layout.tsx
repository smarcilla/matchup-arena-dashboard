'use client';

import { Sidebar } from '@/components';
import { DashboardProvider } from '@/contexts/DashboardContext';

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </DashboardProvider>
  );
}
