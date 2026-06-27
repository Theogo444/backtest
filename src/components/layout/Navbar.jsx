// ============================================================================
//  Navbar.jsx — navigation latérale (desktop) / barre inférieure (mobile)
//  Utilise React Router (NavLink) : de vraies URLs, état actif automatique.
// ============================================================================

import { NavLink, Link } from 'react-router-dom'
import { Home, LineChart, Scale, Landmark, Dices, BookOpen, Moon, Sun, TrendingUp } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/simulateur', label: 'Simulateur', icon: LineChart },
  { to: '/comparateur', label: 'Enveloppes', icon: Scale },
  { to: '/retraite', label: 'Retraite', icon: Landmark },
  { to: '/monte-carlo', label: 'Monte Carlo', icon: Dices },
  { to: '/glossaire', label: 'Glossaire', icon: BookOpen },
]

export default function Navbar({ theme, onToggleTheme }) {
  return (
    <>
      {/* ---------- Sidebar desktop ---------- */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-navy-100 md:bg-white dark:md:border-navy-800 dark:md:bg-navy-900">
        <Link to="/" className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-white">
            <TrendingUp size={20} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-navy-800 dark:text-white">Simulateur</div>
            <div className="text-[11px] font-medium text-navy-400">Portefeuille FR</div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-navy-800 text-white shadow-sm'
                      : 'text-navy-600 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-800'
                  }`
                }
              >
                <Icon size={18} strokeWidth={2.1} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-navy-100 p-3 dark:border-navy-800">
          <button onClick={onToggleTheme} className="btn-secondary w-full">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          </button>
        </div>
      </aside>

      {/* ---------- Header mobile ---------- */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 md:hidden dark:border-navy-800 dark:bg-navy-900">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-white">
            <TrendingUp size={18} />
          </div>
          <span className="text-sm font-extrabold text-navy-800 dark:text-white">Simulateur Portefeuille</span>
        </Link>
        <button
          onClick={onToggleTheme}
          aria-label="Changer de thème"
          className="rounded-lg p-2 text-navy-600 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* ---------- Bottom nav mobile ---------- */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-navy-100 bg-white md:hidden dark:border-navy-800 dark:bg-navy-900">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                  isActive ? 'text-navy-800 dark:text-white' : 'text-navy-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}
