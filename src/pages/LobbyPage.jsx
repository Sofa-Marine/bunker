import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import { createRoom, getRoomByCode, listenPublicRooms, signInAnon, auth,
         listenUserPacks } from '../firebase';

function PlayerDots({ players, max }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {Array.from({ length: Math.min(max, 12) }).map((_, i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: i < players ? 'var(--accent)' : 'var(--border2)',
        }} />
      ))}
    </div>
  );
}

function RoomCard({ room, onJoin }) {
  const playerCount = Object.keys(room.players || {}).length;
  const isFull = playerCount >= (room.maxPlayers || 8);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => !isFull && onJoin(room)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && !isFull ? 'var(--bg3)' : 'var(--bg2)',
        border: `1px solid ${hovered && !isFull ? 'var(--accent)' : 'var(--border)'}`,
        borderLeft: `3px solid ${hovered && !isFull ? 'var(--accent)' : 'var(--border2)'}`,
        padding: '1rem 1.25rem',
        cursor: isFull ? 'default' : 'pointer',
        opacity: isFull ? 0.6 : 1,
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{
          fontFamily: 'var(--title)', fontSize: '1rem', fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)',
          flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {room.name}
        </div>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '0.5rem', letterSpacing: 1,
          padding: '3px 8px', flexShrink: 0,
          border: `1px solid ${isFull ? 'rgba(192,57,43,0.4)' : 'rgba(200,168,75,0.3)'}`,
          color: isFull ? '#e06060' : 'var(--accent)',
          background: isFull ? 'rgba(192,57,43,0.08)' : 'rgba(200,168,75,0.06)',
        }}>
          {isFull ? 'ПОЛНАЯ' : 'ОТКРЫТА'}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>
        {room.cardPack || 'Стандартный пак'}
      </div>

      <PlayerDots players={playerCount} max={room.maxPlayers || 8} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)',
      }}>
        <span>Хост: {room.hostName || '—'}</span>
        <span style={{ color: isFull ? '#e06060' : 'var(--accent)' }}>
          {playerCount}/{room.maxPlayers || 8}
        </span>
      </div>
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
    if (createOpen) { setPackInput('Стандартный пак'); setRoomNameInput(''); setPasswordInput(''); setMaxPlayers(8); }
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

      {/* ── HEADER ────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Title row */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: 4 }}>
              // ЛОББИ
            </div>
            <h2 style={{
              fontFamily: 'var(--title)', fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text)', lineHeight: 1,
            }}>
              ВЫБРАТЬ КОМНАТУ
            </h2>
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <input
              className="search-input"
              placeholder="Поиск комнат..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: '1 1 160px', minWidth: 0 }}
            />
            <button
              className="btn-sm primary"
              onClick={() => setJoinOpen(true)}
              style={{ flexShrink: 0, padding: '0 1rem', height: 42, letterSpacing: 2 }}
            >
              ◈ ПО КОДУ
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                flexShrink: 0, height: 42, padding: '0 1.25rem',
                fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2,
                background: 'var(--accent)', border: '1px solid var(--accent)',
                color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold',
              }}
            >
              + СОЗДАТЬ
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN ──────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>

        {/* Auth banner */}
        {!user && (
          <div style={{
            background: 'rgba(200,168,75,0.05)', border: '1px solid rgba(200,168,75,0.2)',
            padding: '0.875rem 1.25rem', marginBottom: '1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text2)' }}>
              Войдите — статистика и паки сохранятся в профиле
            </div>
            <button
              onClick={() => navigate('auth')}
              style={{
                fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2,
                padding: '6px 16px', background: 'var(--accent)',
                border: '1px solid var(--accent)', color: 'var(--bg)',
                cursor: 'pointer', fontWeight: 'bold',
              }}
            >
              ВОЙТИ
            </button>
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}>
          {[
            ['КОМНАТ', rooms.length],
            ['ОНЛАЙН', rooms.reduce((s, r) => s + Object.keys(r.players || {}).length, 0)],
            ['ОТКРЫТЫХ', rooms.filter(r => r.status !== 'full').length],
          ].map(([label, val]) => (
            <div key={label} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              padding: '0.625rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'var(--title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>{val}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Rooms grid or empty */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }}>☢</div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '0.7rem',
              color: 'var(--text3)', marginBottom: '1.5rem', letterSpacing: 2,
            }}>
              {search ? '// КОМНАТЫ НЕ НАЙДЕНЫ' : '// НЕТ ПУБЛИЧНЫХ КОМНАТ'}
            </div>
            {!search && (
              <button className="btn-main" onClick={() => setCreateOpen(true)}>
                + Создать первую комнату
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
          }}>
            {filtered.map(r => (
              <RoomCard key={r.id} room={r} onJoin={handleJoin} />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: СОЗДАТЬ КОМНАТУ ─────────────────────── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Создать Комнату">
        <div className="form-group">
          <label className="form-label">Название комнаты</label>
          <input
            className="form-input"
            placeholder="Бункер апокалипсиса..."
            value={roomNameInput}
            onChange={e => setRoomNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Макс. игроков: {maxPlayers}</label>
            <div className="range-group">
              <input
                type="range" min="6" max="12"
                value={maxPlayers}
                onChange={e => setMaxPlayers(e.target.value)}
              />
              <span className="range-val">{maxPlayers}</span>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text3)', marginTop: 4 }}>
              Минимум для старта: 6 игроков
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Пак карточек</label>
            <select
              className="form-input"
              value={packInput}
              onChange={e => setPackInput(e.target.value)}
            >
              {packOptions.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            {user && userPacks.length === 0 && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginTop: 6 }}>
                Нет своих паков —{' '}
                <span
                  style={{ color: 'var(--accent)', cursor: 'pointer' }}
                  onClick={() => { setCreateOpen(false); navigate('editor'); }}
                >
                  создать пак
                </span>
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
          <input
            className="form-input"
            type="password"
            placeholder="Оставьте пустым для открытой комнаты"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn-main"
            style={{ flex: 1, minWidth: 120 }}
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? 'Создание...' : '+ Создать комнату'}
          </button>
          <button className="btn-main secondary" onClick={() => setCreateOpen(false)}>
            Отмена
          </button>
        </div>
      </Modal>

      {/* ── MODAL: ВОЙТИ ПО КОДУ ──────────────────────── */}
      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Войти по коду">
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)',
          marginBottom: '1.25rem', letterSpacing: 1,
        }}>
          Введите код, который прислал хост комнаты
        </div>
        <div className="form-group">
          <label className="form-label">Код комнаты</label>
          <input
            className="form-input"
            placeholder="XXXXXX"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
            maxLength={8}
            autoFocus
            style={{ letterSpacing: 6, textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            className="btn-main"
            style={{ flex: 1 }}
            onClick={handleJoinByCode}
            disabled={joinLoading}
          >
            {joinLoading ? 'Поиск...' : '▶ ВОЙТИ'}
          </button>
          <button className="btn-main secondary" onClick={() => setJoinOpen(false)}>
            Отмена
          </button>
        </div>
      </Modal>
    </div>
  );
}
