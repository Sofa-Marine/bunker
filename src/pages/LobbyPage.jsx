import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import { createRoom, getRoomByCode, listenPublicRooms, signInAnon, auth,
         listenUserPacks } from '../firebase';

function PlayerDots({ players, max }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
      {Array.from({ length: Math.min(max, 12) }).map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < players ? 'var(--accent)' : 'var(--border2)' }} />
      ))}
    </div>
  );
}

export default function LobbyPage({ navigate }) {
  const showToast = useToast();
  const { user, profile } = useAuth();

  const [rooms,         setRooms]         = useState([]);
  const [userPacks,     setUserPacks]      = useState([]);
  const [search,        setSearch]         = useState('');
  const [createOpen,    setCreateOpen]     = useState(false);
  const [joinOpen,      setJoinOpen]       = useState(false);
  const [joinCode,      setJoinCode]       = useState('');
  const [joinLoading,   setJoinLoading]    = useState(false);
  const [maxPlayers,    setMaxPlayers]     = useState(8);
  const [roomNameInput, setRoomNameInput]  = useState('');
  const [passwordInput, setPasswordInput]  = useState('');
  const [packInput,     setPackInput]      = useState('Стандартный пак');
  const [creating,      setCreating]       = useState(false);

  useEffect(() => {
    const unsub = listenPublicRooms(setRooms);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) { setUserPacks([]); return; }
    const unsub = listenUserPacks(user.uid, (packs) => setUserPacks(packs));
    return unsub;
  }, [user]);

  useEffect(() => {
    if (createOpen) setPackInput('Стандартный пак');
  }, [createOpen]);

  const filtered = rooms.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function getUidAndName() {
    let uid = auth.currentUser?.uid;
    if (!uid) uid = await signInAnon();
    const playerName = profile?.username || user?.displayName || 'ИГРОК_' + uid.slice(0, 4).toUpperCase();
    return { uid, playerName };
  }

  async function handleJoin(room) {
    if (room.status === 'full') { showToast('Комната заполнена!', 'danger'); return; }
    const { uid, playerName } = await getUidAndName();
    showToast(`Входим в "${room.name}"...`);
    navigate('roomWaiting', {
      isHost: false, roomId: room.id, roomName: room.name,
      maxPlayers: room.maxPlayers || 8,
      cardPack: room.cardPack || 'Стандартный пак', playerName,
    });
  }

  async function handleJoinByCode() {
    const code = joinCode.trim().toUpperCase();
    if (!code) { showToast('Введите код комнаты', 'danger'); return; }
    setJoinLoading(true);
    try {
      const room = await getRoomByCode(code);
      if (!room) { showToast('Комната не найдена или уже идёт игра', 'danger'); return; }
      const { uid, playerName } = await getUidAndName();
      setJoinOpen(false); setJoinCode('');
      navigate('roomWaiting', {
        isHost: false, roomId: room.roomId, roomName: room.name,
        maxPlayers: room.maxPlayers || 8,
        cardPack: room.cardPack || 'Стандартный пак', playerName,
      });
    } catch (e) {
      showToast('Ошибка при поиске комнаты', 'danger');
    } finally { setJoinLoading(false); }
  }

  async function handleCreate() {
    if (!roomNameInput.trim()) { showToast('Введите название!', 'danger'); return; }
    setCreating(true);
    try {
      const { uid, playerName } = await getUidAndName();
      const { roomId, code } = await createRoom(uid, {
        name: roomNameInput.trim(), cardPack: packInput,
        maxPlayers: Number(maxPlayers), password: passwordInput, hostName: playerName,
      });
      setCreateOpen(false);
      showToast(`Комната создана! Код: ${code}`, 'success');
      navigate('roomWaiting', {
        isHost: true, roomId, roomName: roomNameInput.trim(),
        maxPlayers: Number(maxPlayers), cardPack: packInput,
        roomPassword: passwordInput, playerName, inviteCode: code,
      });
    } catch (e) {
      console.error(e);
      showToast('Ошибка создания комнаты', 'danger');
    } finally { setCreating(false); }
  }

  const packOptions = [
    { id: '__standard', name: 'Стандартный пак' },
    ...userPacks.map(p => ({ id: p.id, name: p.name })),
  ];

  return (
    <div className="page-wrapper">
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '1.5rem', overflowY: 'auto' }}>
          <div className="sidebar-title">// АКТИВНЫЕ КОМНАТЫ</div>
          {rooms.length === 0 && <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', padding: '1rem 0' }}>Нет публичных комнат</div>}
          {rooms.slice(0, 10).map(r => (
            <div key={r.id} onClick={() => handleJoin(r)}
              style={{ padding: '1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s', borderLeft: '3px solid var(--accent)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ fontFamily: 'var(--title)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)', marginBottom: 4 }}>{r.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', display: 'flex', gap: '1rem' }}>
                <span>👥 {Object.keys(r.players || {}).length}/{r.maxPlayers || 8}</span>
                <span>{r.cardPack || 'Стандартный'}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          <div className="lobby-toolbar" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="search-input" placeholder="Поиск комнат..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
            <button className="btn-main secondary" onClick={() => setJoinOpen(true)} style={{ flexShrink: 0 }}>◈ По коду</button>
            <button className="btn-main" onClick={() => setCreateOpen(true)} style={{ flexShrink: 0 }}>+ Создать</button>
          </div>

          {!user && (
            <div style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.2)', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text2)' }}>Войдите чтобы статистика и паки сохранялись в профиле</div>
              <button onClick={() => navigate('auth')} style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, padding: '6px 16px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>ВОЙТИ</button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>☢</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>
                {search ? '// Комнаты не найдены' : '// Нет публичных комнат. Создайте первую!'}
              </div>
              <button className="btn-main" onClick={() => setCreateOpen(true)}>+ Создать комнату</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)' }}>
              {filtered.map(r => {
                const playerCount = Object.keys(r.players || {}).length;
                const isFull = playerCount >= (r.maxPlayers || 8);
                return (
                  <div key={r.id} onClick={() => !isFull && handleJoin(r)}
                    style={{ background: 'var(--bg2)', padding: '1.5rem', cursor: isFull ? 'default' : 'pointer', transition: 'all 0.15s', borderLeft: '3px solid transparent', opacity: isFull ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!isFull) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.borderLeftColor = 'var(--accent)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.borderLeftColor = 'transparent'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ fontFamily: 'var(--title)', fontSize: '1rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)' }}>{r.name}</div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 1, padding: '3px 8px', border: '1px solid var(--border2)', color: isFull ? '#e06060' : 'var(--accent)' }}>
                        {isFull ? 'ПОЛНАЯ' : 'ОТКРЫТА'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '1rem', fontFamily: 'var(--mono)' }}>{r.cardPack || 'Стандартный пак'}</div>
                    <PlayerDots players={playerCount} max={r.maxPlayers || 8} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>
                      <span>Хост: {r.hostName || '—'}</span>
                      <span>{playerCount}/{r.maxPlayers || 8}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Создать Комнату">
        <div className="form-group">
          <label className="form-label">Название комнаты</label>
          <input className="form-input" placeholder="Бункер апокалипсиса..." value={roomNameInput} onChange={e => setRoomNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Макс. игроков: {maxPlayers}</label>
            <div className="range-group">
              <input type="range" min="4" max="12" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} />
              <span className="range-val">{maxPlayers}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Пак карточек</label>
            <select className="form-input" value={packInput} onChange={e => setPackInput(e.target.value)}>
              {packOptions.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            {user && userPacks.length === 0 && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginTop: 6 }}>
                Нет своих паков —{' '}
                <span style={{ color: 'var(--accent)', cursor: 'pointer' }}
                  onClick={() => { setCreateOpen(false); navigate('editor'); }}>создать пак</span>
              </div>
            )}
            {!user && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginTop: 6 }}>
                Войдите чтобы использовать свои паки
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Пароль (опционально)</label>
          <input className="form-input" type="password" placeholder="Оставьте пустым для открытой комнаты" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn-main" style={{ flex: 1 }} onClick={handleCreate} disabled={creating}>
            {creating ? 'Создание...' : 'Создать комнату'}
          </button>
          <button className="btn-main secondary" onClick={() => setCreateOpen(false)}>Отмена</button>
        </div>
      </Modal>

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Войти по коду">
        <div className="form-group">
          <label className="form-label">Код комнаты</label>
          <input className="form-input" placeholder="XXXXXX" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleJoinByCode()} maxLength={8} style={{ letterSpacing: 4, textAlign: 'center', fontSize: '1.1rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn-main" style={{ flex: 1 }} onClick={handleJoinByCode} disabled={joinLoading}>
            {joinLoading ? 'Поиск...' : '▶ ВОЙТИ'}
          </button>
          <button className="btn-main secondary" onClick={() => setJoinOpen(false)}>Отмена</button>
        </div>
      </Modal>
    </div>
  );
}
