import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { id: 'home',   label: 'ГЛАВНАЯ',  icon: '⌂' },
  { id: 'lobby',  label: 'ЛОББИ',    icon: '⊞' },
  { id: 'editor', label: 'РЕДАКТОР', icon: '✎' },
  { id: 'guide',  label: 'ГАЙД',     icon: '?' },
];

export default function Navbar({ currentPage, navigate }) {
  const { user, profile } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [currentPage]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <nav style={{
        height: 56,
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('home')}
          onDoubleClick={() => navigate('admin')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          title="☢"
        >
          <span style={{ fontSize: '1.1rem' }}>☢</span>
          <span style={{ fontFamily: 'var(--title)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase' }}>БУНКЕР</span>
        </div>

        {/* Desktop Nav links */}
        <div className="navbar-links">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              style={{
                padding: '0 1rem', height: 40,
                fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2,
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${currentPage === item.id ? 'var(--accent)' : 'transparent'}`,
                color: currentPage === item.id ? 'var(--accent)' : 'var(--text3)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (currentPage !== item.id) e.target.style.color = 'var(--text2)'; }}
              onMouseLeave={e => { if (currentPage !== item.id) e.target.style.color = 'var(--text3)'; }}>
              {item.label}
            </button>
          ))}
          {profile?.isAdmin && (
            <button onClick={() => navigate('admin')}
              style={{
                padding: '0 1rem', height: 40,
                fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2,
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${currentPage === 'admin' ? '#e06060' : 'transparent'}`,
                color: currentPage === 'admin' ? '#e06060' : 'rgba(192,57,43,0.5)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              ADMIN
            </button>
          )}
        </div>

        {/* Right area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Auth — desktop only */}
          <div className="navbar-auth">
            {user ? (
              <div onClick={() => navigate('profile')} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                padding: '6px 12px',
                border: `1px solid ${currentPage === 'profile' ? 'var(--accent)' : 'var(--border2)'}`,
                background: currentPage === 'profile' ? 'rgba(200,168,75,0.08)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'rgba(200,168,75,0.15)', border: '1px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--accent)',
                }}>
                  {(profile?.username || user.displayName || 'U').charAt(0)}
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text2)', letterSpacing: 1 }}>
                  {profile?.username || user.displayName || 'ПРОФИЛЬ'}
                </span>
              </div>
            ) : (
              <button onClick={() => navigate('auth')}
                style={{
                  padding: '7px 18px', fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2,
                  background: 'var(--accent)', border: '1px solid var(--accent)',
                  color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold',
                }}>
                ВОЙТИ
              </button>
            )}
          </div>

          {/* Burger button — mobile only */}
          <button
            className="navbar-burger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Меню"
            style={{
              background: drawerOpen ? 'rgba(200,168,75,0.1)' : 'transparent',
              border: `1px solid ${drawerOpen ? 'var(--accent)' : 'var(--border2)'}`,
              color: drawerOpen ? 'var(--accent)' : 'var(--text2)',
              width: 36, height: 36,
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem', lineHeight: 1,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            {drawerOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 299,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? 'all' : 'none',
          transition: 'opacity 0.25s',
        }}
      />

      {/* Side Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0,
        width: 270,
        height: '100dvh',
        background: 'var(--bg2)',
        borderLeft: '1px solid var(--border)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)' }}>// НАВИГАЦИЯ</div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }}>✕</button>
        </div>

        {/* User card */}
        {user ? (
          <div
            onClick={() => { navigate('profile'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: currentPage === 'profile' ? 'rgba(200,168,75,0.07)' : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(200,168,75,0.15)', border: '2px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: '0.9rem', color: 'var(--accent)', flexShrink: 0,
            }}>
              {(profile?.username || user.displayName || 'U').charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--title)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: 1, color: 'var(--text)', textTransform: 'uppercase' }}>
                {profile?.username || user.displayName || 'ИГРОК'}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--accent)', letterSpacing: 1, marginTop: 2 }}>
                МОЙ ПРОФИЛЬ →
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => { navigate('auth'); }}
              style={{
                width: '100%', padding: '11px', fontFamily: 'var(--mono)',
                fontSize: '0.75rem', letterSpacing: 2,
                background: 'var(--accent)', border: '1px solid var(--accent)',
                color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold',
              }}>
              ВОЙТИ
            </button>
          </div>
        )}

        {/* Nav items */}
        <div style={{ flex: 1, padding: '0.5rem 0' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1.25rem',
                background: currentPage === item.id ? 'rgba(200,168,75,0.08)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${currentPage === item.id ? 'var(--accent)' : 'transparent'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '1rem',
                color: currentPage === item.id ? 'var(--accent)' : 'var(--text3)',
                width: 22, textAlign: 'center', flexShrink: 0,
              }}>{item.icon}</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 2,
                color: currentPage === item.id ? 'var(--accent)' : 'var(--text2)',
                textTransform: 'uppercase',
              }}>{item.label}</span>
            </button>
          ))}

          {profile?.isAdmin && (
            <button onClick={() => navigate('admin')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1.25rem',
                background: currentPage === 'admin' ? 'rgba(192,57,43,0.08)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${currentPage === 'admin' ? '#e06060' : 'transparent'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                marginTop: '0.5rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: '1rem', color: '#c0392b', width: 22, textAlign: 'center', flexShrink: 0 }}>⚙</span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 2,
                color: currentPage === 'admin' ? '#e06060' : 'rgba(192,57,43,0.65)',
                textTransform: 'uppercase',
              }}>ADMIN</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)',
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 2, color: 'var(--text3)' }}>
            ☢ БУНКЕР — ВЫЖИВИ ЛЮБОЙ ЦЕНОЙ
          </div>
        </div>
      </div>
    </>
  );
}
