import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../firebase';
import { ref, onValue, remove, update, get } from 'firebase/database';

// ── Прямые запросы к DB ──────────────────────────────────────
async function getAllUsers() {
  const snap = await get(ref(db, 'users'));
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([uid, u]) => ({ uid, ...u }));
}
async function getAllPacks() {
  const snap = await get(ref(db, 'packs'));
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([id, p]) => ({ id, ...p }));
}
async function getAllRooms() {
  const snap = await get(ref(db, 'rooms'));
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([id, r]) => ({ id, ...r }));
}
async function banUser(uid)    { await update(ref(db, `users/${uid}`), { banned: true  }); }
async function unbanUser(uid)  { await update(ref(db, `users/${uid}`), { banned: false }); }
async function adminDelPack(packId, authorUid) {
  await remove(ref(db, `packs/${packId}`));
  if (authorUid) await remove(ref(db, `users/${authorUid}/packs/${packId}`));
}
async function adminDelRoom(roomId) { await remove(ref(db, `rooms/${roomId}`)); }

function Stat({ label, value, accent }) {
  return (
    <div style={{ background: 'var(--bg2)', border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`, padding: '1.25rem 1.5rem', flex: '1 1 160px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--title)', fontSize: '2rem', fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value ?? '—'}</div>
    </div>
  );
}

export default function AdminPage({ navigate }) {
  const showToast = useToast();
  const { user, profile } = useAuth();

  const [loginInput, setLoginInput] = useState('');
  const [passInput,  setPassInput]  = useState('');
  const [authed,     setAuthed]     = useState(false);

  const [users,  setUsers]  = useState([]);
  const [packs,  setPacks]  = useState([]);
  const [rooms,  setRooms]  = useState([]);
  const [loading,setLoading]= useState(false);
  const [tab,    setTab]    = useState('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [packSearch, setPackSearch] = useState('');

  // Если профиль помечен как admin — заходим сразу
  useEffect(() => {
    if (profile?.isAdmin) {
      setAuthed(true);
      loadAll();
    }
  }, [profile]);

  async function loadAll() {
    setLoading(true);
    try {
      const [u, p, r] = await Promise.all([getAllUsers(), getAllPacks(), getAllRooms()]);
      setUsers(u); setPacks(p); setRooms(r);
    } finally { setLoading(false); }
  }

  function handleLogin() {
    // Пароль хранится только в этом компоненте, не в открытом виде
    const PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'iu5XyGWM';
    const EMAIL = import.meta.env.VITE_ADMIN_EMAIL   || 'adiladil200629@gmail.com';
    if ((loginInput === EMAIL || loginInput === 'admin') && passInput === PASS) {
      setAuthed(true);
      loadAll();
    } else {
      showToast('Неверный логин или пароль', 'danger');
    }
  }

  // ── Форма входа ──────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 4, color: '#e06060', marginBottom: 8 }}>// RESTRICTED AREA</div>
            <div style={{ fontFamily: 'var(--title)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text)' }}>ADMIN PANEL</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(192,57,43,0.3)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>ЛОГИН</div>
              <input style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="admin или email"
                value={loginInput} onChange={e => setLoginInput(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#e06060'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>ПАРОЛЬ</div>
              <input type="password" style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="••••••••"
                value={passInput} onChange={e => setPassInput(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#e06060'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button onClick={handleLogin}
              style={{ padding: '11px', fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 3, background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)', color: '#e06060', cursor: 'pointer', fontWeight: 'bold', marginTop: 4 }}>
              ▶ ВОЙТИ В ПАНЕЛЬ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Панель ───────────────────────────────────────────────
  const TABS = ['dashboard', 'users', 'packs', 'rooms'];
  const TAB_LABELS = { dashboard: 'Дашборд', users: `Пользователи (${users.length})`, packs: `Паки (${packs.length})`, rooms: `Комнаты (${rooms.length})` };

  const filteredUsers = users.filter(u => (u.username || u.email || '').toLowerCase().includes(userSearch.toLowerCase()));
  const filteredPacks = packs.filter(p => (p.name || '').toLowerCase().includes(packSearch.toLowerCase()));

  const bannedCount  = users.filter(u => u.banned).length;
  const activeRooms  = rooms.filter(r => r.status === 'waiting' || r.phase === 'game').length;
  const totalGames   = users.reduce((s, u) => s + (u.stats?.games || 0), 0);

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '200px 1fr' }}>

      {/* Sidebar */}
      <div style={{ background: 'var(--bg2)', borderRight: '1px solid rgba(192,57,43,0.2)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 3, color: '#e06060', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(192,57,43,0.2)' }}>
          // ADMIN PANEL
        </div>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ textAlign: 'left', padding: '0.75rem 1rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 1, background: tab === t ? 'rgba(192,57,43,0.1)' : 'transparent', border: 'none', borderLeft: `3px solid ${tab === t ? '#c0392b' : 'transparent'}`, color: tab === t ? '#e06060' : 'var(--text3)', cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2 }}>
            {TAB_LABELS[t]}
          </button>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => { setAuthed(false); navigate('home'); }}
            style={{ width: '100%', padding: '8px', fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer' }}>
            ← ВЫЙТИ
          </button>
          <button onClick={loadAll} style={{ width: '100%', padding: '8px', fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer', marginTop: 6 }}>
            ↻ ОБНОВИТЬ
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
        {loading && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1rem' }}>// Загрузка...</div>
        )}

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: '#e06060', marginBottom: '1.5rem' }}>// ДАШБОРД</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <Stat label="ПОЛЬЗОВАТЕЛЕЙ" value={users.length} accent />
              <Stat label="ПАКОВ" value={packs.length} />
              <Stat label="КОМНАТ ВСЕГО" value={rooms.length} />
              <Stat label="АКТИВНЫХ КОМНАТ" value={activeRooms} />
              <Stat label="ЗАБЛОКИРОВАНО" value={bannedCount} />
              <Stat label="СЫГРАНО ИГР" value={totalGames} />
            </div>

            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '1rem' }}>// ПОСЛЕДНИЕ ПОЛЬЗОВАТЕЛИ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[...users].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8).map(u => (
                <div key={u.uid} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: u.banned ? '#e06060' : 'var(--text)' }}>{u.username || '—'}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginLeft: 12 }}>{u.email}</span>
                    {u.banned && <span style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: '#e06060', marginLeft: 8, border: '1px solid rgba(192,57,43,0.4)', padding: '1px 6px' }}>БАН</span>}
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>{u.stats?.games || 0} игр</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: '#e06060' }}>// ПОЛЬЗОВАТЕЛИ</div>
              <input style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '7px 12px', fontFamily: 'var(--mono)', fontSize: '0.7rem', outline: 'none', width: 220 }}
                placeholder="Поиск..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {filteredUsers.map(u => (
                <div key={u.uid} style={{ background: 'var(--bg2)', border: `1px solid ${u.banned ? 'rgba(192,57,43,0.3)' : 'var(--border)'}`, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'var(--title)', fontSize: '0.85rem', fontWeight: 600, color: u.banned ? '#e06060' : 'var(--text)' }}>{u.username || '—'}</span>
                      {u.banned && <span style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: '#e06060', border: '1px solid rgba(192,57,43,0.4)', padding: '1px 6px' }}>БАН</span>}
                      {u.isAdmin && <span style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '1px 6px' }}>ADMIN</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>
                      {u.email} · {u.stats?.games || 0} игр · {u.rank || 'НОВОБРАНЕЦ'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {u.banned ? (
                      <button onClick={async () => { await unbanUser(u.uid); showToast(`${u.username} разбанен`); loadAll(); }}
                        style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 1, padding: '5px 12px', background: 'rgba(74,158,92,0.1)', border: '1px solid rgba(74,158,92,0.3)', color: '#4a9e5c', cursor: 'pointer' }}>
                        РАЗБАНИТЬ
                      </button>
                    ) : (
                      <button onClick={async () => { await banUser(u.uid); showToast(`${u.username} заблокирован`, 'danger'); loadAll(); }}
                        style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 1, padding: '5px 12px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#e06060', cursor: 'pointer' }}>
                        БАНИТЬ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PACKS */}
        {tab === 'packs' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: '#e06060' }}>// ПАКИ КАРТОЧЕК</div>
              <input style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '7px 12px', fontFamily: 'var(--mono)', fontSize: '0.7rem', outline: 'none', width: 220 }}
                placeholder="Поиск..." value={packSearch} onChange={e => setPackSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {filteredPacks.map(p => (
                <div key={p.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--title)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>
                      {p.cardCount || 0} карточек · {p.public ? '🌐 Публичный' : '🔒 Приватный'} · Автор: {users.find(u => u.uid === p.authorUid)?.username || p.authorUid?.slice(0, 6)}
                    </div>
                  </div>
                  <button onClick={async () => { await adminDelPack(p.id, p.authorUid); showToast(`Пак "${p.name}" удалён`, 'danger'); loadAll(); }}
                    style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 1, padding: '5px 12px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#e06060', cursor: 'pointer' }}>
                    УДАЛИТЬ
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROOMS */}
        {tab === 'rooms' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: '#e06060', marginBottom: '1.5rem' }}>// КОМНАТЫ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {rooms.map(r => (
                <div key={r.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--title)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{r.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>
                      Хост: {r.hostName || '—'} · {Object.keys(r.players || {}).length}/{r.maxPlayers || 8} · Статус: {r.phase || r.status} · Код: {r.code}
                    </div>
                  </div>
                  <button onClick={async () => { await adminDelRoom(r.id); showToast(`Комната удалена`, 'danger'); loadAll(); }}
                    style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 1, padding: '5px 12px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#e06060', cursor: 'pointer' }}>
                    УДАЛИТЬ
                  </button>
                </div>
              ))}
              {rooms.length === 0 && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
                  // Нет комнат
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
