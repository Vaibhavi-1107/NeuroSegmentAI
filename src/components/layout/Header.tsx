import { NavLink } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Overview', path: '/' },
  { label: 'Workspace', path: '/workspace' },
  { label: 'Methodology', path: '/methodology' },
  { label: 'Evaluation', path: '/evaluation' },
  { label: 'About', path: '/about' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 w-full z-50"
      style={{
        background: 'rgba(13,15,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        height: '56px',
      }}
    >
      <div
        className="flex items-center justify-between px-6 h-full"
        style={{ maxWidth: '1280px', margin: '0 auto' }}
      >
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md"
            style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent-border)' }}
          >
            <Brain size={14} style={{ color: 'var(--color-accent)' }} />
          </div>
          <span
            className="font-mono font-bold tracking-widest text-sm"
            style={{ color: 'var(--color-accent)', letterSpacing: '0.12em' }}
          >
            NEUROSEGMENT
          </span>
          <span
            className="hidden sm:inline-block text-xs font-mono px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--color-accent-dim)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent-border)',
              fontSize: '0.6rem',
              letterSpacing: '0.05em',
            }}
          >
            AI
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.8125rem',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              })}
              className="hover:text-white"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* API Status Badge */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono"
            style={{
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.3)',
              color: 'var(--color-accent)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
              style={{ background: 'var(--color-accent)' }}
            />
            SAM 3.1 · API Backend
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden animate-fade-in"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 24px',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                textDecoration: 'none',
                borderBottom: '1px solid var(--color-border-subtle)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
