import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

function animateCounter(setter, target, duration) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    setter(Math.floor(start).toLocaleString('ru'));
  }, 16);
}

const FEATURES = [
  {
    title: 'Мультиплеер',
    text: 'Играй с друзьями или незнакомцами. До 12 игроков в одной комнате. Присоединяйся по коду.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 40 Q8 28 24 28 Q40 28 40 40" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="38" cy="14" r="4" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="10" cy="14" r="4" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    title: 'Редактор паков',
    text: 'Создавай собственные карточки, сценарии катастроф и условия бункера. Делись с сообществом.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="16" x2="24" y2="32" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="16" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Тест выживания',
    text: 'Финальный тест определяет шансы вашего отряда. Сможет ли ваш состав выжить в бункере?',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 24 L22 30 L32 18" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: 'Сценарии',
    text: 'Ядерная война, пандемия, зомби, метеорит — каждый сценарий меняет ценность характеристик.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="4" x2="24" y2="14" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="34" x2="24" y2="44" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4" y1="24" x2="14" y2="24" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="34" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="9" y1="9" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="31" y1="31" x2="39" y2="39" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="39" y1="9" x2="31" y2="17" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="17" y1="31" x2="9" y2="39" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Профиль и ранги',
    text: 'Отслеживай статистику, получай достижения и поднимайся по рангам — от Новобранца до Легенды.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none">
        <polyline points="8,36 16,24 24,28 34,12 42,18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="8" y1="40" x2="42" y2="40" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    title: 'Своя карточка',
    text: 'Каждый игрок получает уникальный набор характеристик. Используй их, чтобы убедить группу оставить тебя.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none">
        <path d="M24 8 L28 18 L40 18 L30 26 L34 38 L24 31 L14 38 L18 26 L8 18 L20 18 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
];

export default function HomePage({ navigate }) {
  const { user, profile } = useAuth();
  const [games, setGames] = useState('0');
  const animated = useRef(false);

  useEffect(() => {
    if (!animated.current) {
      animated.current = true;
      setTimeout(() => {
        animateCounter(setGames, 12847, 2000);
      }, 300);
    }
  }, []);

  return (
    <div className="page-wrapper">
      {/* HERO */}
      <div style={{
        position: 'relative',
        minHeight: 'calc(100vh - 56px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 60% 40% at 50% 60%, rgba(200,168,75,0.04) 0%, transparent 70%),
                       radial-gradient(ellipse 80% 60% at 20% 30%, rgba(139,58,42,0.06) 0%, transparent 50%)`,
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(200,168,75,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(200,168,75,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}/>

        <div style={{ position: 'relative', textAlign: 'center', padding: '2rem', maxWidth: 900 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 4,
            color: 'var(--accent)', textTransform: 'uppercase',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 12,
          }}>
            <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--accent)', opacity: 0.5 }}/>
            ▼ Ядерная угроза. Критический уровень. ▼
            <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--accent)', opacity: 0.5 }}/>
          </div>

          <h1 style={{
            fontFamily: 'var(--title)',
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--text)',
            lineHeight: 0.95, marginBottom: '0.5rem',
            textShadow: '0 0 60px rgba(200,168,75,0.2)',
          }}>
            БУН<span style={{ color: 'var(--accent)' }}>КЕР</span>
          </h1>

          <div style={{
            fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 6,
            color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '2rem',
          }}>
            Настольная игра · Бесплатно
          </div>

          <p style={{
            fontSize: '1.05rem', color: 'var(--text2)',
            maxWidth: 500, margin: '0 auto 3rem', lineHeight: 1.8,
          }}>
            Апокалипсис наступил. Места в бункере ограничены. Докажи свою ценность или будь изгнан.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-main" onClick={() => navigate('lobby')}>Найти игру</button>
            {user ? (
              <button className="btn-main secondary" onClick={() => navigate('profile')}>
                Мой профиль
              </button>
            ) : (
              <button className="btn-main secondary" onClick={() => navigate('auth')}>
                Создать аккаунт
              </button>
            )}
          </div>

          {user && (
            <div style={{ marginTop: '1.5rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)' }}>
              Привет, <span style={{ color: 'var(--accent)' }}>{profile?.username || user.displayName}</span> · {profile?.stats?.games || 0} игр сыграно
            </div>
          )}
        </div>

        {/* Stats — только реальный счётчик игр */}
        <div style={{
          position: 'absolute', bottom: '3rem', left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '1.5rem', color: 'var(--accent)', display: 'block' }}>{games}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase' }}>Игр сыграно</span>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section">
        <div className="section-header">
          <div className="section-label">// ВОЗМОЖНОСТИ</div>
          <div className="section-title">Почему Бункер?</div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1px', background: 'var(--border)',
          border: '1px solid var(--border)',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'var(--bg2)', padding: '2rem',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
            >
              {f.icon}
              <div style={{
                fontFamily: 'var(--title)', fontSize: '1.1rem', fontWeight: 600,
                letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text)', marginBottom: '0.5rem',
              }}>{f.title}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text2)', lineHeight: 1.7 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        padding: '5rem 2rem', textAlign: 'center',
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
      }}>
        <div className="section-label">// ГОТОВ ВОЙТИ?</div>
        <h2 style={{
          fontFamily: 'var(--title)', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text)', margin: '0.5rem 0 1.5rem',
        }}>
          Займи место в <span style={{ color: 'var(--accent)' }}>бункере</span>
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text2)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
          Докажи, что ты достоин выжить.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <button className="btn-main" onClick={() => navigate('lobby')}>Найти игру</button>
          ) : (
            <button className="btn-main" onClick={() => navigate('auth')}>Начать бесплатно</button>
          )}
          <button className="btn-main secondary" onClick={() => navigate('guide')}>Как играть</button>
        </div>
      </div>
    </div>
  );
}
