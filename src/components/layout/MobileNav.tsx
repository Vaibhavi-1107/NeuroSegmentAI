import { NavLink } from 'react-router-dom';
import { Home, Layers, BookOpen, BarChart2, Info } from 'lucide-react';

const navItems = [
  { label: 'Overview', path: '/', icon: Home },
  { label: 'Workspace', path: '/workspace', icon: Layers },
  { label: 'Method', path: '/methodology', icon: BookOpen },
  { label: 'Eval', path: '/evaluation', icon: BarChart2 },
  { label: 'About', path: '/about', icon: Info },
];

export function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 w-full z-50"
      style={{
        height: '64px',
        background: 'rgba(13,15,20,0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
    >
      {navItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            textDecoration: 'none',
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-dim)',
            transition: 'color 0.15s',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
