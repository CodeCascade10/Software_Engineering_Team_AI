export default function DashboardLayout({
  navbar,
  hero,
  sidebar,
  content,
  commandPalette,
  toasts,
}) {
  return (
    <div className="min-h-screen bg-[#080a0f] text-white overflow-hidden">

      {/* GLOBAL BG */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#f5a62311,transparent_25%),radial-gradient(circle_at_bottom_right,#3b82f611,transparent_25%)] pointer-events-none" />

      {/* NAVBAR */}
      {navbar}

      {/* MAIN */}
      <main className="relative z-10 px-6 lg:px-10 py-8 space-y-8">

        {/* HERO */}
        {hero}

        {/* BODY */}
        <div className={sidebar ? "grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8" : "w-full"}>

          {/* LEFT */}
          {sidebar && (
            <aside className="space-y-6">
              {sidebar}
            </aside>
          )}

          {/* RIGHT */}
          <section className="space-y-6 min-w-0 flex-1">
            {content}
          </section>
        </div>
      </main>

      {/* OVERLAYS */}
      {commandPalette}

      {toasts}
    </div>
  );
}