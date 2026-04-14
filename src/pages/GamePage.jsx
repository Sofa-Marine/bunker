import { useState, useEffect, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import {
  auth,
  listenPlayers, listenRoom, listenChat, sendChatMessage,
  setPlayerReady, advancePhase,
} from '../firebase';

const CARD_CATEGORIES = ['Профессия','Здоровье','Фобия','Хобби','Багаж','Факт','Действие','Возраст'];

const CARDS_POOL = {
  'Профессия': ['Хирург','Инженер-ядерщик','Агроном','Военный снайпер','Психолог','Повар','Электрик','Программист','Биолог'],
  'Здоровье':  ['Абсолютно здоров','Диабет 1 типа','Аллергия на пыль','Ночная слепота','Здоров как бык'],
  'Фобия':     ['Клаустрофобия','Агорафобия','Арахнофобия','Никтофобия','Страх крови','Нет фобий'],
  'Хобби':     ['Садоводство','Боевые искусства','Медитация','Охота','Радиолюбительство','Кулинария'],
  'Багаж':     ['АК-47','Аптечка','Семена растений','Ноутбук с энциклопедией','Пустой рюкзак'],
  'Факт':      ['Бывший военный','Знает 5 языков','Служил в ФСБ','Вырос в деревне','Чёрный пояс'],
  'Действие':  ['Может убедить группу','Может исследовать зону','Меняет профессию','Спасает изгнанного'],
  'Возраст':   ['18 лет','25 лет','34 года','45 лет','52 года','67 лет'],
};

function randCard(cat) {
  const arr = CARDS_POOL[cat];
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMyCards() {
  return CARD_CATEGORIES.map(label => ({ label, val: randCard(label), hidden: true }));
}

export default function GamePage({ navigate, gameState }) {
  const showToast = useToast();
  const isHost  = gameState?.isHost ?? true;
  const roomId  = gameState?.roomId ?? null;
  const round   = gameState?.round  ?? 1;
  const myUid   = auth.currentUser?.uid;

  const [myCards, setMyCards]   = useState(() => generateMyCards());
  const [players, setPlayers]   = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [allReady, setAllReady] = useState(false);
  const [revealedLog, setRevealedLog] = useState([]);
  const chatEndRef = useRef(null);

  // ── Firebase listeners ────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const unsubPlayers = listenPlayers(roomId, updated => {
      setPlayers(updated);
      const active = updated.filter(p => !p.eliminated);
      const ready  = active.every(p => p.ready);
      setAllReady(ready && active.length > 0);
    });

    const unsubChat = listenChat(roomId, msgs => setMessages(msgs));

    // Non-host: listen for phase changes
    const unsubRoom = listenRoom(roomId, room => {
      if (!room) return;
      if (!isHost && room.phase === 'voting') {
        navigate('voting', { ...gameState, round: room.round });
      }
      if (!isHost && room.phase === 'test') {
        navigate('test', gameState);
      }
    });

    return () => { unsubPlayers(); unsubChat(); unsubRoom(); };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  // ── Actions ───────────────────────────────────────────────
  async function revealCard(idx) {
    if (!myCards[idx].hidden) return;
    const card = myCards[idx];
    setMyCards(prev => prev.map((c, i) => i === idx ? { ...c, hidden: false } : c));
    const logEntry = `ВЫ раскрыли: ${card.label} — ${card.val}`;
    setRevealedLog(prev => [...prev, logEntry]);
    showToast(`Карта "${card.label}" раскрыта`);

    // Mark as ready in Firebase
    if (roomId && myUid) {
      await setPlayerReady(roomId, myUid, `${card.label}: ${card.val}`);
      await sendChatMessage(roomId, { author: 'ВЫ', text: `Раскрываю: ${card.label} — ${card.val}` });
    }
  }

  function sendMessage() {
    if (!chatInput.trim() || !roomId) return;
    sendChatMessage(roomId, { author: gameState?.playerName ?? 'ВЫ', text: chatInput });
    setChatInput('');
  }

  async function goToVoting() {
    if (!isHost || !allReady || !roomId) return;
    await advancePhase(roomId, 'voting', { round });
    navigate('voting', { ...gameState, round });
  }

  const activePlayers = players.filter(p => !p.eliminated);

  return (
    <div className="page-wrapper" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 56px)' }}>

        {/* LEFT: players + log */}
        <div style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', padding: '0.875rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: 4 }}>ТЕКУЩИЙ РАУНД</div>
            <div style={{ fontFamily: 'var(--title)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>{round}</div>
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>// ИГРОКИ</div>

          {activePlayers.map(p => (
            <div key={p.uid} style={{ background: 'var(--bg3)', border: `1px solid ${p.ready ? 'var(--accent)' : 'var(--border)'}`, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'border-color 0.3s' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.uid === myUid ? 'rgba(200,168,75,0.15)' : 'var(--bg4)', border: `2px solid ${p.ready ? 'var(--accent)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: p.ready ? 'var(--accent)' : 'var(--text2)', flexShrink: 0 }}>
                {p.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--title)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}{p.uid === myUid && ' (ВЫ)'}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: p.ready ? 'var(--accent)' : 'var(--text3)', marginTop: 2 }}>
                  {p.ready ? `✓ ${p.revealedCard ?? 'Раскрыто'}` : '○ Ожидание...'}
                </div>
              </div>
            </div>
          ))}

          {revealedLog.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.5rem' }}>// РАСКРЫТО</div>
              {revealedLog.map((log, i) => (
                <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text2)', padding: '0.4rem 0.5rem', background: 'rgba(200,168,75,0.05)', borderLeft: '2px solid var(--accent)', marginBottom: 4, lineHeight: 1.5 }}>{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* CENTER: my cards */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>

          {/* Status bar */}
          <div style={{ background: 'var(--bg2)', border: `1px solid ${allReady ? 'var(--accent)' : 'var(--border)'}`, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', transition: 'border-color 0.5s' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: allReady ? 'var(--accent)' : 'var(--text3)', marginBottom: 3 }}>
                {allReady ? '// ВСЕ ГОТОВЫ — РАУНД ЗАВЕРШЁН' : `// РАУНД ${round} — РАСКРОЙ КАРТУ`}
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                {allReady
                  ? isHost ? 'Нажмите кнопку для перехода к голосованию.' : 'Ожидание хоста...'
                  : myCards.some(c => !c.hidden) ? 'Карта раскрыта. Ожидаем остальных...' : 'Выберите одну карту ниже и нажмите на неё.'}
              </div>
            </div>
            {allReady && isHost && (
              <button onClick={goToVoting} style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '10px 28px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>
                ▶ ГОЛОСОВАНИЕ
              </button>
            )}
          </div>

          {/* Cards grid */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '1rem' }}>// МОИ КАРТЫ — нажмите скрытую карту чтобы раскрыть её</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {myCards.map((card, i) => (
                <div key={card.label} onClick={() => card.hidden && revealCard(i)}
                  style={{ background: !card.hidden ? 'rgba(200,168,75,0.06)' : 'var(--bg3)', border: `1px solid ${!card.hidden ? 'var(--accent)' : 'var(--border)'}`, padding: '1rem', cursor: card.hidden ? 'pointer' : 'default', transition: 'all 0.2s', position: 'relative' }}
                  onMouseEnter={e => { if (card.hidden) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { if (card.hidden) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>{card.label}</div>
                  <div style={{ fontFamily: 'var(--title)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: card.hidden ? 'var(--text3)' : 'var(--text)', fontStyle: card.hidden ? 'italic' : 'normal' }}>
                    {card.hidden ? '— скрыто —' : card.val}
                  </div>
                  {card.hidden && <div style={{ position: 'absolute', bottom: 6, right: 8, fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--accent)', opacity: 0.6 }}>нажать</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Bunker mini info */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[['☢ Бункер', 'А-7'], ['Сценарий', 'Ядерная война'], ['Угроза', '87%'], ['Игроков', activePlayers.length]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 2, color: 'var(--text3)' }}>{k}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text)', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating chat */}
      <button onClick={() => setChatOpen(o => !o)}
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: 52, height: 52, borderRadius: '50%', background: chatOpen ? 'var(--accent)' : 'var(--bg3)', border: `2px solid ${chatOpen ? 'var(--accent)' : 'var(--border2)'}`, color: chatOpen ? 'var(--bg)' : 'var(--text)', cursor: 'pointer', fontSize: '1.2rem', zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        {chatOpen ? '✕' : '💬'}
      </button>

      {chatOpen && (
        <div style={{ position: 'fixed', bottom: '5.5rem', right: '2rem', width: 320, background: 'var(--bg2)', border: '1px solid var(--border2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 99, display: 'flex', flexDirection: 'column', maxHeight: 420, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--accent)' }}>// ЧАТ ИГРЫ</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ padding: '0.4rem 0.6rem', background: m.system ? 'rgba(200,168,75,0.05)' : 'var(--bg3)', borderLeft: `2px solid ${m.system ? 'var(--accent)' : 'var(--border2)'}` }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--accent)', marginBottom: 2 }}>{m.author}</div>
                <div style={{ fontSize: m.system ? '0.65rem' : '0.8rem', color: m.system ? 'var(--accent)' : 'var(--text2)', fontFamily: m.system ? 'var(--mono)' : 'inherit', lineHeight: 1.4 }}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: '0.5rem' }}>
            <input style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRight: 'none', color: 'var(--text)', padding: '7px 10px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none' }}
              placeholder="Сообщение..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} style={{ background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', padding: '7px 12px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.7rem', fontWeight: 'bold' }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
