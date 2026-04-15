import { useState, useEffect, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import {
  auth, db,
  listenPlayers, listenRoom, listenChat, sendChatMessage,
  setPlayerReady, advancePhase,
} from '../firebase';
import { ref, update } from 'firebase/database';
import { SPECIAL_ACTIONS, ACTION_TYPE_COLOR, ACTION_TYPE_LABEL } from '../data/specialActions';

// ── Карточный пул ────────────────────────────────────────────
const CARDS_POOL = {
  'Профессия': ['Хирург','Инженер-ядерщик','Агроном','Военный снайпер','Психолог','Повар','Электрик','Программист','Биолог'],
  'Здоровье':  ['Абсолютно здоров','Диабет 1 типа','Аллергия на пыль','Ночная слепота','Здоров как бык'],
  'Фобия':     ['Клаустрофобия','Агорафобия','Арахнофобия','Никтофобия','Страх крови','Нет фобий'],
  'Хобби':     ['Садоводство','Боевые искусства','Медитация','Охота','Радиолюбительство','Кулинария'],
  'Багаж':     ['АК-47 с 3 магазинами','Аптечка','Семена растений','Ноутбук с энциклопедией','Пустой рюкзак'],
  'Факт':      ['Бывший военный','Знает 5 языков','Служил в ФСБ','Вырос в деревне','Чёрный пояс'],
  'Возраст':   ['18 лет','25 лет','34 года','45 лет','52 года','67 лет'],
};

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateMyCards() {
  // Обычные карты — видны только игроку, скрыты для других
  const normal = Object.entries(CARDS_POOL).map(([label, pool]) => ({
    label,
    val: randItem(pool),
    hidden: true,      // скрыта для других
    seenByMe: true,    // но видна самому игроку
    isSpecial: false,
    used: false,
  }));
  // Одна случайная спец-карта
  const action = randItem(SPECIAL_ACTIONS);
  const special = {
    label: 'Спец-действие',
    val: action.name,
    actionId: action.id,
    desc: action.desc,
    actionType: action.type,
    needsConsent: action.needsConsent,
    hidden: true,
    seenByMe: true,
    isSpecial: true,
    used: false,
  };
  return [...normal, special];
}

// ── Модалка подтверждения ────────────────────────────────────
function ConfirmModal({ card, onConfirm, onCancel }) {
  const color = ACTION_TYPE_COLOR[card.actionType] || 'var(--accent)';
  const typeLabel = ACTION_TYPE_LABEL[card.actionType] || card.actionType;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--bg2)', border: `1px solid ${color}`, padding: '2rem', maxWidth: 420, width: '100%', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 3, color, marginBottom: 8 }}>
          // СПЕЦ-ДЕЙСТВИЕ · {typeLabel}
        </div>
        <div style={{ fontFamily: 'var(--title)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: 1, color: 'var(--text)', marginBottom: '1rem' }}>
          {card.val}
        </div>
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text2)', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}>{card.desc}</p>
        </div>
        {card.needsConsent && (
          <div style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.2)', padding: '0.75rem', marginBottom: '1.25rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--accent)' }}>
            ⚠ Требует согласия пати — объяви вслух и действуй только при согласии группы
          </div>
        )}
        {card.actionType === 'info' && (
          <div style={{ background: 'rgba(74,158,92,0.06)', border: '1px solid rgba(74,158,92,0.2)', padding: '0.75rem', marginBottom: '1.25rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: '#4a9e5c' }}>
            ℹ Информационное действие — не меняет механику игры, только общение
          </div>
        )}
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>
          Использовать спец-действие? Оно будет потрачено навсегда.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2, background: color, border: `1px solid ${color}`, color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            ДА, ИСПОЛЬЗОВАТЬ
          </button>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2, background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer' }}>
            ОТМЕНА
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Компонент карточки ───────────────────────────────────────
function Card({ card, idx, onReveal, onSpecialUse, alreadyRevealed, myUid }) {
  const isSpecial = card.isSpecial;
  const color = isSpecial ? (ACTION_TYPE_COLOR[card.actionType] || 'var(--accent)') : 'var(--accent)';

  // Карта скрытая (hidden=true) — показываем значение ТОЛЬКО самому игроку (seenByMe)
  // Раскрытая — показываем всем через revealedCard в Firebase
  const showValue = card.seenByMe; // видим своё значение всегда
  const isRevealed = !card.hidden; // раскрыта для всех
  const isUsed = card.used;

  if (isSpecial) {
    return (
      <div
        onClick={() => !isUsed && onSpecialUse(idx)}
        style={{
          background: isUsed ? 'var(--bg3)' : `rgba(${isSpecial ? '42,74,130' : '200,168,75'},0.06)`,
          border: `1px solid ${isUsed ? 'var(--border)' : color}`,
          padding: '0.875rem',
          cursor: isUsed ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: isUsed ? 0.5 : 1,
          position: 'relative',
          gridColumn: 'span 1',
        }}
        onMouseEnter={e => { if (!isUsed) e.currentTarget.style.background = `rgba(58,110,168,0.12)`; }}
        onMouseLeave={e => { if (!isUsed) e.currentTarget.style.background = `rgba(42,74,130,0.06)`; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', letterSpacing: 2, textTransform: 'uppercase', color }}>
            {ACTION_TYPE_LABEL[card.actionType] || 'СПЕЦ'}
          </div>
          {isUsed && <div style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--text3)' }}>ИСПОЛЬЗОВАНО</div>}
        </div>
        <div style={{ fontFamily: 'var(--title)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: 1, color: isUsed ? 'var(--text3)' : 'var(--text)' }}>
          {card.val}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginTop: 4, lineHeight: 1.4 }}>
          {card.desc?.slice(0, 60)}{card.desc?.length > 60 ? '...' : ''}
        </div>
        {!isUsed && (
          <div style={{ position: 'absolute', bottom: 6, right: 8, fontFamily: 'var(--mono)', fontSize: '0.5rem', color, opacity: 0.7 }}>
            нажать ✦
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => !isRevealed && !alreadyRevealed && onReveal(idx)}
      style={{
        background: isRevealed ? 'rgba(200,168,75,0.06)' : 'var(--bg3)',
        border: `1px solid ${isRevealed ? 'var(--accent)' : alreadyRevealed ? 'var(--border)' : 'var(--border)'}`,
        padding: '0.875rem',
        cursor: isRevealed ? 'default' : alreadyRevealed ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: alreadyRevealed && !isRevealed ? 0.5 : 1,
        position: 'relative',
      }}
      onMouseEnter={e => { if (!isRevealed && !alreadyRevealed) e.currentTarget.style.borderColor = 'var(--accent)'; }}
      onMouseLeave={e => { if (!isRevealed) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>
        {card.label}
      </div>
      {/* Значение — видно самому игроку всегда, но помечено как скрытое */}
      {showValue ? (
        <div>
          <div style={{ fontFamily: 'var(--title)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: isRevealed ? 'var(--text)' : 'var(--text2)' }}>
            {card.val}
          </div>
          {!isRevealed && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--text3)', marginTop: 3 }}>
              👁 видно только вам · нажать чтобы раскрыть всем
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontFamily: 'var(--title)', fontSize: '0.9rem', color: 'var(--text3)', fontStyle: 'italic' }}>
          — скрыто —
        </div>
      )}
      {isRevealed && (
        <div style={{ position: 'absolute', top: 6, right: 8, fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--accent)', opacity: 0.8 }}>✓ ОТКРЫТО</div>
      )}
      {!isRevealed && !alreadyRevealed && (
        <div style={{ position: 'absolute', bottom: 6, right: 8, fontFamily: 'var(--mono)', fontSize: '0.5rem', color: 'var(--accent)', opacity: 0.5 }}>раскрыть</div>
      )}
    </div>
  );
}

// ── Главный компонент ────────────────────────────────────────
export default function GamePage({ navigate, gameState }) {
  const showToast = useToast();
  const isHost  = gameState?.isHost ?? true;
  const roomId  = gameState?.roomId ?? null;
  const round   = gameState?.round  ?? 1;
  const myUid   = auth.currentUser?.uid;

  const [myCards, setMyCards]     = useState(() => generateMyCards());
  const [players, setPlayers]     = useState([]);
  const [messages, setMessages]   = useState([]);
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [allReady, setAllReady]   = useState(false);
  const [confirmCard, setConfirmCard] = useState(null); // карта для подтверждения спец-действия
  const [showPlayers, setShowPlayers] = useState(false); // мобильный drawer игроков
  const chatEndRef = useRef(null);

  // Сколько обычных карт раскрыто в этом раунде
  const revealedCount = myCards.filter(c => !c.isSpecial && !c.hidden).length;
  const canReveal = revealedCount === 0; // только одна карта за ход

  // ── Firebase ─────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    // Сохраняем свои карты в Firebase чтобы можно было вернуться
    if (myUid) {
      update(ref(db, `rooms/${roomId}/players/${myUid}`), {
        myCards: JSON.stringify(myCards),
      }).catch(() => {});
    }

    const unsubPlayers = listenPlayers(roomId, updated => {
      setPlayers(updated);
      const active = updated.filter(p => !p.eliminated);
      setAllReady(active.length > 0 && active.every(p => p.ready));
    });

    const unsubChat = listenChat(roomId, msgs => setMessages(msgs));

    const unsubRoom = listenRoom(roomId, room => {
      if (!room) return;
      if (!isHost && room.phase === 'voting') navigate('voting', { ...gameState, round: room.round });
      if (!isHost && room.phase === 'test')   navigate('test', gameState);
    });

    return () => { unsubPlayers(); unsubChat(); unsubRoom(); };
  }, [roomId]);

  // Восстановление карт из Firebase при возврате в игру
  useEffect(() => {
    if (!roomId || !myUid) return;
    // Получаем сохранённые карты если есть
    const me = players.find(p => p.uid === myUid);
    if (me?.myCards) {
      try {
        const saved = JSON.parse(me.myCards);
        if (Array.isArray(saved) && saved.length > 0) {
          setMyCards(saved);
        }
      } catch {}
    }
  }, [players.length > 0]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  // ── Раскрыть обычную карту ───────────────────────────────
  async function revealCard(idx) {
    if (!canReveal) { showToast('Можно раскрыть только одну карту за раунд', 'danger'); return; }
    if (myCards[idx].hidden === false) return;
    const card = myCards[idx];
    const updated = myCards.map((c, i) => i === idx ? { ...c, hidden: false } : c);
    setMyCards(updated);
    showToast(`Карта "${card.label}" раскрыта для всех`);

    if (roomId && myUid) {
      await setPlayerReady(roomId, myUid, `${card.label}: ${card.val}`);
      await sendChatMessage(roomId, {
        author: gameState?.playerName ?? 'ИГРОК',
        text: `Раскрываю: ${card.label} — ${card.val}`,
      });
      // Обновляем сохранённые карты
      await update(ref(db, `rooms/${roomId}/players/${myUid}`), {
        myCards: JSON.stringify(updated),
      });
    }
  }

  // ── Спец-действие ────────────────────────────────────────
  function trySpecialAction(idx) {
    if (myCards[idx].used) { showToast('Спец-действие уже использовано', 'danger'); return; }
    setConfirmCard({ ...myCards[idx], idx });
  }

  async function confirmSpecialAction() {
    const { idx } = confirmCard;
    const card = myCards[idx];
    const updated = myCards.map((c, i) => i === idx ? { ...c, used: true } : c);
    setMyCards(updated);
    setConfirmCard(null);
    showToast(`Спец-действие "${card.val}" использовано!`);

    if (roomId && myUid) {
      await sendChatMessage(roomId, {
        author: gameState?.playerName ?? 'ИГРОК',
        text: `⚡ Использует спец-действие: «${card.val}» — ${card.desc}`,
        system: true,
      });
      await update(ref(db, `rooms/${roomId}/players/${myUid}`), {
        myCards: JSON.stringify(updated),
      });
    }
  }

  function sendMessage() {
    if (!chatInput.trim() || !roomId) return;
    sendChatMessage(roomId, { author: gameState?.playerName ?? 'ИГРОК', text: chatInput });
    setChatInput('');
  }

  async function goToVoting() {
    if (!isHost || !allReady || !roomId) return;
    await advancePhase(roomId, 'voting', { round });
    navigate('voting', { ...gameState, round });
  }

  const activePlayers = players.filter(p => !p.eliminated);
  const me = players.find(p => p.uid === myUid);

  // ── Рендер ───────────────────────────────────────────────
  return (
    <div className="game-root">

      {/* ─── МОДАЛКА ПОДТВЕРЖДЕНИЯ ─── */}
      {confirmCard && (
        <ConfirmModal
          card={confirmCard}
          onConfirm={confirmSpecialAction}
          onCancel={() => setConfirmCard(null)}
        />
      )}

      {/* ─── МОБИЛЬНЫЙ DRAWER ИГРОКОВ ─── */}
      {showPlayers && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowPlayers(false)} />
          <div style={{ width: 280, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)' }}>// ИГРОКИ</div>
              <button onClick={() => setShowPlayers(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            {activePlayers.map(p => (
              <div key={p.uid} style={{ background: 'var(--bg3)', border: `1px solid ${p.ready ? 'var(--accent)' : 'var(--border)'}`, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: p.uid === myUid ? 'rgba(200,168,75,0.15)' : 'var(--bg4)', border: `2px solid ${p.ready ? 'var(--accent)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: p.ready ? 'var(--accent)' : 'var(--text2)', flexShrink: 0 }}>
                  {p.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--title)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}{p.uid === myUid && ' (ВЫ)'}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: p.ready ? 'var(--accent)' : 'var(--text3)', marginTop: 2 }}>
                    {p.ready ? `✓ ${p.revealedCard ?? 'Раскрыто'}` : '○ Ожидание...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── МОБИЛЬНЫЙ ТОП-БАР ─── */}
      <div className="game-mobile-bar">
        <button onClick={() => setShowPlayers(true)} className="game-mobile-btn">
          👥 {activePlayers.length}
        </button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: 2 }}>
          РАУНД {round}
        </div>
        <button onClick={() => setChatOpen(o => !o)} className="game-mobile-btn">
          💬
        </button>
      </div>

      {/* ─── ДЕСКТОП: левая колонка игроков ─── */}
      <div className="game-sidebar">
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', padding: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: 4 }}>РАУНД</div>
          <div style={{ fontFamily: 'var(--title)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>{round}</div>
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>// ИГРОКИ</div>

        {activePlayers.map(p => (
          <div key={p.uid} style={{ background: 'var(--bg3)', border: `1px solid ${p.ready ? 'var(--accent)' : 'var(--border)'}`, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', transition: 'border-color 0.3s' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: p.uid === myUid ? 'rgba(200,168,75,0.15)' : 'var(--bg4)', border: `2px solid ${p.ready ? 'var(--accent)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: p.ready ? 'var(--accent)' : 'var(--text2)', flexShrink: 0 }}>
              {p.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--title)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name}{p.uid === myUid && ' (ВЫ)'}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: p.ready ? 'var(--accent)' : 'var(--text3)', marginTop: 2 }}>
                {p.ready ? `✓ ${p.revealedCard ?? 'Раскрыто'}` : '○ Ожидание...'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── ЦЕНТР: статус + карты ─── */}
      <div className="game-center">

        {/* Статус-бар */}
        <div style={{ background: 'var(--bg2)', border: `1px solid ${allReady ? 'var(--accent)' : 'var(--border)'}`, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', transition: 'border-color 0.5s', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: allReady ? 'var(--accent)' : 'var(--text3)', marginBottom: 3 }}>
              {allReady ? '// ВСЕ ГОТОВЫ' : `// РАУНД ${round} — РАСКРОЙ КАРТУ`}
            </div>
            <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
              {allReady
                ? isHost ? 'Нажмите кнопку для перехода к голосованию.' : 'Ожидание хоста...'
                : canReveal ? 'Выбери одну карту и нажми чтобы раскрыть её для всех.' : 'Карта раскрыта. Ожидаем остальных...'}
            </div>
          </div>
          {allReady && isHost && (
            <button onClick={goToVoting} style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '10px 24px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>
              ▶ ГОЛОСОВАНИЕ
            </button>
          )}
        </div>

        {/* Подсказка */}
        {canReveal && (
          <div style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.15)', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>👁 Карты видны только тебе — нажми чтобы показать всем</span>
            <span>✦ Спец-действие можно использовать в любой момент</span>
          </div>
        )}

        {/* Карты */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '1rem' }}>
            // МОИ КАРТЫ {!canReveal && '— карта раскрыта в этом раунде'}
          </div>
          <div className="game-cards-grid">
            {myCards.map((card, i) => (
              <Card
                key={`${card.label}-${i}`}
                card={card}
                idx={i}
                onReveal={revealCard}
                onSpecialUse={trySpecialAction}
                alreadyRevealed={!canReveal && !card.isSpecial && card.hidden}
                myUid={myUid}
              />
            ))}
          </div>
        </div>

        {/* Бункер инфо */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {[['☢', 'А-7'], ['Сценарий', gameState?.scenario || 'Ядерная война'], ['Угроза', '87%'], ['Игроков', activePlayers.length]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.5rem', letterSpacing: 2, color: 'var(--text3)' }}>{k}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text)', marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ЧАТ (floating на мобиле, фикс на десктопе) ─── */}
      <button
        onClick={() => setChatOpen(o => !o)}
        className="game-chat-fab"
        style={{ background: chatOpen ? 'var(--accent)' : 'var(--bg3)', border: `2px solid ${chatOpen ? 'var(--accent)' : 'var(--border2)'}`, color: chatOpen ? 'var(--bg)' : 'var(--text)' }}
      >
        {chatOpen ? '✕' : '💬'}
      </button>

      {chatOpen && (
        <div className="game-chat-panel">
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--accent)', display: 'flex', justifyContent: 'space-between' }}>
            // ЧАТ
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>✕</button>
          </div>
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
            <input
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRight: 'none', color: 'var(--text)', padding: '8px 10px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none' }}
              placeholder="Сообщение..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} style={{ background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', padding: '8px 12px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.7rem', fontWeight: 'bold' }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
