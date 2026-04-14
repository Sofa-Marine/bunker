import { useState, useEffect, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import {
  signInAnon, auth,
  joinRoom, leaveRoom, deleteRoom,
  listenPlayers, listenChat, sendChatMessage,
  updateRoom, advancePhase,
} from '../firebase';

export default function RoomWaitingPage({ navigate, gameState, setGameState }) {
  const showToast = useToast();
  const isHost    = gameState?.isHost    ?? true;
  const roomId    = gameState?.roomId    ?? null;
  const roomName  = gameState?.roomName  ?? 'БУНКЕР А-7';
  const maxPlayers = gameState?.maxPlayers ?? 8;
  const cardPack  = gameState?.cardPack  ?? 'Стандартный пак';
  const roomPassword = gameState?.roomPassword ?? '';

  const [uid, setUid]           = useState(auth.currentUser?.uid ?? null);
  const [players, setPlayers]   = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied]     = useState(false);
  const chatEndRef = useRef(null);

  // ── Auth + join ──────────────────────────────────────────
  useEffect(() => {
    let unsubPlayers, unsubChat;

    async function init() {
      let currentUid = uid;
      if (!currentUid) {
        currentUid = await signInAnon();
        setUid(currentUid);
      }

      if (!roomId) return; // shouldn't happen

      // Join room as player
      await joinRoom(roomId, {
        name: gameState?.playerName ?? 'ИГРОК_' + currentUid.slice(0,4).toUpperCase(),
        avatar: (gameState?.playerName ?? 'ИГ').slice(0,2).toUpperCase(),
        isHost,
        ready: false,
      });

      // Listen to players
      unsubPlayers = listenPlayers(roomId, setPlayers);

      // Listen to chat
      unsubChat = listenChat(roomId, setMessages);
    }

    init().catch(console.error);

    return () => {
      unsubPlayers?.();
      unsubChat?.();
      // leave room on unmount if not host starting game
    };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!chatInput.trim() || !roomId) return;
    sendChatMessage(roomId, {
      author: gameState?.playerName ?? 'ВЫ',
      text: chatInput,
    });
    setChatInput('');
  }

  function copyCode() {
    navigator.clipboard?.writeText(roomId ?? 'N/A').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function kickPlayer(playerUid) {
    const p = players.find(x => x.uid === playerUid);
    await leaveRoom(roomId, playerUid);
    showToast(`${p?.name ?? 'Игрок'} исключён`, 'danger');
  }

  async function handleLeaveRoom() {
    if (!roomId || !uid) return;
    await leaveRoom(roomId, uid);
    showToast('Вы вышли из комнаты');
    navigate('lobby');
  }

  async function handleDeleteLobby() {
    if (!isHost || !roomId) return;
    if (!confirm('Удалить комнату? Все игроки будут выгнаны.')) return;
    await deleteRoom(roomId);
    showToast('Комната удалена', 'danger');
    navigate('lobby');
  }

  async function startGame() {
    if (!isHost || !roomId) return;
    await advancePhase(roomId, 'briefing', { round: 1 });
    navigate('briefing', { ...gameState });
  }

  const canStart = players.length >= 2 && isHost;
  const inviteCode = roomId ? roomId.slice(0, 8).toUpperCase() : '...';

  return (
    <div className="page-wrapper" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Room header */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(200,168,75,0.04))', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>// КОМНАТА</div>
                <div style={{ fontFamily: 'var(--title)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>{roomName}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', marginTop: 4 }}>{cardPack}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copyCode} style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, padding: '6px 14px', background: copied ? 'rgba(200,168,75,0.15)' : 'var(--bg3)', border: '1px solid var(--border2)', color: copied ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {copied ? '✓ СКОПИРОВАНО' : `◈ КОД: ${inviteCode}`}
                  </button>
                  {isHost && (
                    <button onClick={() => setSettingsOpen(s => !s)} style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, padding: '6px 14px', background: settingsOpen ? 'rgba(200,168,75,0.1)' : 'var(--bg3)', border: `1px solid ${settingsOpen ? 'var(--accent)' : 'var(--border2)'}`, color: settingsOpen ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      ⚙ НАСТРОЙКИ
                    </button>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)' }}>
                  {players.length} / {maxPlayers} игроков
                  {roomPassword && <span style={{ marginLeft: 8, color: 'var(--accent)', opacity: 0.7 }}>🔒 С паролем</span>}
                </div>
              </div>
            </div>

            {settingsOpen && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>ПАРОЛЬ</div>
                  <input style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none', boxSizing: 'border-box' }} type="password" defaultValue={roomPassword} placeholder="Без пароля" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>ПАК КАРТОЧЕК</div>
                  <select style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none' }}>
                    <option>Стандартный пак</option>
                    <option>Ядерный апокалипсис</option>
                    <option>Пандемия 2026</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>МИН. ДЛЯ СТАРТА</div>
                  <select style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none' }}>
                    <option>2 игрока</option>
                    <option>4 игрока</option>
                    <option>6 игроков</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>ТИП КОМНАТЫ</div>
                  <select style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none' }}>
                    <option>Публичная</option>
                    <option>Приватная</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <button style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, padding: '8px 20px', background: 'rgba(200,168,75,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer' }}
                    onClick={async () => {
                      await updateRoom(roomId, { cardPack });
                      setSettingsOpen(false);
                      showToast('Настройки сохранены', 'success');
                    }}>
                    СОХРАНИТЬ НАСТРОЙКИ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Players grid */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '1rem' }}>// ИГРОКИ В КОМНАТЕ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {players.map(p => (
                <div key={p.uid} style={{ background: 'var(--bg3)', border: `1px solid ${p.isHost ? 'var(--accent)' : 'var(--border)'}`, padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', animation: 'fadeIn 0.4s ease' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: p.isHost ? 'rgba(200,168,75,0.15)' : 'var(--bg4)', border: `2px solid ${p.isHost ? 'var(--accent)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: p.isHost ? 'var(--accent)' : 'var(--text2)', flexShrink: 0 }}>
                    {p.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--title)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: p.isHost ? 'var(--accent)' : 'var(--text3)', marginTop: 2 }}>
                      {p.isHost ? '★ ХОСТ' : p.ready ? '● ГОТОВ' : '○ ОЖИДАНИЕ'}
                    </div>
                  </div>
                  {isHost && p.uid !== uid && (
                    <button title="Выгнать" onClick={() => kickPlayer(p.uid)}
                      style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.3)', color: '#e06060', cursor: 'pointer', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  )}
                </div>
              ))}
              {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ background: 'var(--bg3)', border: '1px dashed var(--border)', padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35, minHeight: 66 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: 2 }}>СВОБОДНО</div>
                </div>
              ))}
            </div>
          </div>

          {/* Start / waiting bar */}
          {isHost ? (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: canStart ? 'var(--text2)' : 'var(--text3)' }}>
                {players.length < 2 ? `Нужно минимум 2 игрока (${players.length}/2)` : `Готово — ${players.length} игроков`}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={handleDeleteLobby}
                  style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2, textTransform: 'uppercase', padding: '10px 20px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.4)', color: '#e06060', cursor: 'pointer', transition: 'all 0.2s' }}>
                  ✕ УДАЛИТЬ ЛОББИ
                </button>
                <button onClick={startGame} disabled={!canStart}
                  style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, textTransform: 'uppercase', padding: '12px 32px', background: canStart ? 'var(--accent)' : 'var(--bg3)', border: `1px solid ${canStart ? 'var(--accent)' : 'var(--border)'}`, color: canStart ? 'var(--bg)' : 'var(--text3)', cursor: canStart ? 'pointer' : 'not-allowed', fontWeight: 'bold', transition: 'all 0.2s' }}>
                  ▶ НАЧАТЬ ИГРУ
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: 2 }}>
                // ОЖИДАНИЕ ХОСТА ДЛЯ СТАРТА...
              </div>
              <button onClick={handleLeaveRoom}
                style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2, textTransform: 'uppercase', padding: '10px 20px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: '#e06060', cursor: 'pointer', transition: 'all 0.2s' }}>
                ← ВЫЙТИ ИЗ КОМНАТЫ
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Chat */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', height: 'fit-content', position: 'sticky', top: '4rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>// ЧАТ ЛОББИ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 300, maxHeight: 420, overflowY: 'auto', marginBottom: '0.75rem' }}>
            {messages.length === 0 && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', textAlign: 'center', padding: '2rem 0' }}>// Чат пуст</div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ padding: '0.5rem 0.75rem', background: m.system ? 'rgba(200,168,75,0.05)' : 'var(--bg3)', borderLeft: `2px solid ${m.system ? 'var(--accent)' : 'var(--border2)'}` }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 1, color: 'var(--accent)', marginBottom: 2 }}>{m.author}</div>
                <div style={{ fontSize: m.system ? '0.65rem' : '0.8rem', color: m.system ? 'var(--accent)' : 'var(--text2)', fontFamily: m.system ? 'var(--mono)' : 'inherit', lineHeight: 1.5 }}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <input style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRight: 'none', color: 'var(--text)', padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none' }}
              placeholder="Сообщение..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} style={{ background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.7rem', fontWeight: 'bold' }}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
