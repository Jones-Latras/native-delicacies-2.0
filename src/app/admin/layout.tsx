export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar — will be built in Phase 8 */}
      <aside className="hidden w-64 border-r border-stone-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-stone-100 px-6">
          <span className="text-lg font-bold text-amber-800">Admin Panel</span>
        </div>
        <nav className="p-4">
          <p className="text-xs text-stone-400">Dashboard navigation — coming in Phase 8</p>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center border-b border-stone-200 bg-white px-6">
          <h1 className="text-sm font-medium text-stone-600">Admin Dashboard</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
