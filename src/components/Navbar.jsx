import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { id: 'home',   label: 'ГЛАВНАЯ'  },
  { id: 'lobby',  label: 'ЛОББИ'   },
  { id: 'editor', label: 'РЕДАКТОР'},
  { id: 'guide',  label: 'ГАЙД'    },
];

export default function Navbar({ currentPage, navigate }) {
  const { user, profile } = useAuth();

  return (
    <nav style={{
      height: 56, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 200,
    }}>
      {/* Logo — двойной клик открывает admin */}
      <div
        onClick={() => navigate('home')}
        onDoubleClick={() => navigate('admin')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
        title="☢"
      >
        <span style={{ fontSize: '1.1rem' }}>☢</span>
        <span style={{ fontFamily: 'var(--title)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase' }}>БУНКЕР</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 2 }}>
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
        {/* Admin link — visible only if logged in as admin */}
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

      {/* Auth area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
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
    </nav>
  );
}
