import { useState, useEffect } from 'react';
import { listenRoom, advancePhase } from '../firebase';

const SCENARIO_DATA = {
  nuclear: {
    scenario: 'ЯДЕРНАЯ ВОЙНА', icon: '☢', danger: 95,
    description: 'Глобальный ядерный конфликт уничтожил большую часть цивилизации. Радиация накрыла 80% поверхности Земли. Выжившие сосредоточены в изолированных зонах.',
    bunker: 'БУНКЕР А-7', capacity: '5 мест', food: '24 месяца', water: '18 месяцев', area: '200 м²', condition: 'Отличное',
    task: 'Выбрать лучших выживших, которые смогут восстановить цивилизацию. Каждый раунд игрок раскрывает карту и убеждает группу оставить его. После раунда — голосование.',
    rules: [
      'Каждый ход игрок раскрывает одну карту характеристики',
      'Можно раскрыть только одну карту за ход',
      'После каждого раунда — голосование об исключении',
      'Исключённый игрок выбывает окончательно',
      'Финальный тест оценивает группу выживших',
    ],
  },
};

export default function BriefingPage({ navigate, gameState }) {
  const [step, setStep]       = useState(0);
  const [phase, setPhase]     = useState('briefing');
  const isHost   = gameState?.isHost  ?? true;
  const roomId   = gameState?.roomId  ?? null;

  const b = SCENARIO_DATA.nuclear;

  // Non-host: listen for host advancing to game
  useEffect(() => {
    if (isHost || !roomId) return;
    const unsub = listenRoom(roomId, room => {
      if (room?.phase === 'game') navigate('game', { ...gameState, round: room.round ?? 1 });
    });
    return unsub;
  }, [roomId, isHost]);

  async function startGame() {
    if (!isHost || !roomId) return;
    await advancePhase(roomId, 'game', { round: 1 });
    navigate('game', { ...gameState, round: 1 });
  }

  return (
    <div className="page-wrapper" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 760, width: '100%' }}>

        {step === 0 && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '2.5rem', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{b.icon}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 4, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>// СЦЕНАРИЙ</div>
            <div style={{ fontFamily: 'var(--title)', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '1.5rem' }}>{b.scenario}</div>

            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{b.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
              {[['Бункер', b.bunker], ['Вместимость', b.capacity], ['Состояние', b.condition]].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '1rem' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--title)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: 1 }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginBottom: 6, letterSpacing: 1 }}>
                <span>УРОВЕНЬ УГРОЗЫ</span><span style={{ color: '#e06060' }}>{b.danger}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill danger" style={{ width: `${b.danger}%`, transition: 'width 1.5s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setStep(1)} style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '12px 32px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer' }}>
                ПРАВИЛА ИГРЫ →
              </button>
              {isHost ? (
                <button onClick={startGame} style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '12px 32px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>
                  ▶ НАЧАТЬ ИГРУ
                </button>
              ) : (
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', padding: '12px 24px', border: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ animation: 'blink 1.2s infinite' }}>●</span> ОЖИДАНИЕ ХОСТА...
                </div>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '2.5rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 4, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>// ПРАВИЛА ИГРЫ</div>
            <div style={{ fontFamily: 'var(--title)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '1.5rem' }}>КАК ИГРАТЬ</div>

            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{b.task}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {b.rules.map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem', background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--accent)', flexShrink: 0, minWidth: 24 }}>0{i + 1}</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.5 }}>{rule}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(0)} style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2, padding: '10px 24px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer' }}>
                ← НАЗАД
              </button>
              {isHost ? (
                <button onClick={startGame} style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '12px 32px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>
                  ▶ НАЧАТЬ ИГРУ
                </button>
              ) : (
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', padding: '12px 24px', border: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ animation: 'blink 1.2s infinite' }}>●</span> ОЖИДАНИЕ ХОСТА...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
