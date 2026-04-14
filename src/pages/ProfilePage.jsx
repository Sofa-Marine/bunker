import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { updateProfile_, saveSettings, listenUserPacks, deletePack, logoutUser } from '../firebase';

const RANKS = [
  { min: 0,   label: 'НОВОБРАНЕЦ',        icon: '◌' },
  { min: 5,   label: 'ВЫЖИВШИЙ',          icon: '◎' },
  { min: 15,  label: 'БОЕЦ БУНКЕРА',      icon: '◈' },
  { min: 30,  label: 'ЛЕЙТЕНАНТ',         icon: '✦' },
  { min: 60,  label: 'КАПИТАН БУНКЕРА',   icon: '★' },
  { min: 100, label: 'ЛЕГЕНДА АПОКАЛИПСИСА', icon: '☢' },
];

function getRank(games) {
  return [...RANKS].reverse().find(r => games >= r.min) || RANKS[0];
}

const THEMES = [
  { id: 'default', color: '#c8a84b', title: 'Золотой' },
  { id: 'green',   color: '#4a9e5c', title: 'Зелёный' },
  { id: 'red',     color: '#c0392b', title: 'Красный' },
  { id: 'blue',    color: '#3a6ea8', title: 'Синий' },
  { id: 'light',   color: '#f0ece0', title: 'Светлая', dark: false },
];

const ACHIEVEMENTS = [
  { id: 'first_win',   name: 'ПЕРВАЯ КРОВЬ',   desc: 'Выиграй первую игру',          icon: '⚔', key: 'wins',     threshold: 1  },
  { id: 'survivor10',  name: 'ВЫЖИВШИЙ',        desc: 'Выживи в 10 играх',            icon: '☢', key: 'survived', threshold: 10 },
  { id: 'veteran',     name: 'ВЕТЕРАН',         desc: 'Сыграй 30 игр',                icon: '◈', key: 'games',    threshold: 30 },
  { id: 'legend',      name: 'ЛЕГЕНДА',         desc: 'Сыграй 100 игр',               icon: '★', key: 'games',    threshold: 100},
  { id: 'eliminator',  name: 'КАРАТЕЛЬ',        desc: 'Выбери изгнанного 20 раз',     icon: '✕', key: 'eliminated',threshold:20 },
  { id: 'champion',    name: 'ЧЕМПИОН',         desc: '50 побед',                     icon: '🏆', key: 'wins',    threshold: 50 },
];

export default function ProfilePage({ navigate }) {
  const showToast = useToast();
  const { user, profile, setProfile } = useAuth();

  const [activeTab, setActiveTab]   = useState('stats');
  const [editing, setEditing]       = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [packs, setPacks]           = useState([]);
  const [saving, setSaving]         = useState(false);

  const stats    = profile?.stats    || { games: 0, wins: 0, survived: 0, eliminated: 0 };
  const settings = profile?.settings || { theme: 'default', fontSize: 16 };
  const rank     = getRank(stats.games);

  useEffect(() => {
    if (!user) return;
    setUsernameInput(profile?.username || '');
    const unsub = listenUserPacks(user.uid, setPacks);
    return unsub;
  }, [user, profile]);

  async function saveUsername() {
    if (!usernameInput.trim() || !user) return;
    setSaving(true);
    try {
      await updateProfile_(user.uid, { username: usernameInput.trim().toUpperCase() });
      setProfile(prev => ({ ...prev, username: usernameInput.trim().toUpperCase() }));
      setEditing(false);
      showToast('Никнейм обновлён', 'success');
    } finally { setSaving(false); }
  }

  async function applyTheme(themeId) {
    document.body.removeAttribute('data-theme');
    if (themeId !== 'default') document.body.setAttribute('data-theme', themeId);
    if (user) await saveSettings(user.uid, { ...settings, theme: themeId });
    setProfile(prev => ({ ...prev, settings: { ...prev?.settings, theme: themeId } }));
    showToast('Тема изменена');
  }

  async function applyFontSize(v) {
    document.documentElement.style.fontSize = v + 'px';
    if (user) await saveSettings(user.uid, { ...settings, fontSize: Number(v) });
    setProfile(prev => ({ ...prev, settings: { ...prev?.settings, fontSize: Number(v) } }));
  }

  async function handleDeletePack(packId) {
    if (!user) return;
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;
    if (pack.authorUid && pack.authorUid !== user.uid) {
      showToast('Нельзя удалить чужой пак', 'danger');
      return;
    }
    if (!confirm('Удалить пак? Это действие нельзя отменить.')) return;
    await deletePack(user.uid, packId);
    showToast('Пак удалён', 'danger');
  }

  async function handleLogout() {
    await logoutUser();
    navigate('home');
    showToast('Выход выполнен');
  }

  if (!user) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>// Войдите чтобы просматривать профиль</div>
          <button onClick={() => navigate('auth')} style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '12px 32px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>
            ▶ ВОЙТИ
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'stats',        label: 'Статистика' },
    { id: 'achievements', label: 'Достижения' },
    { id: 'packs',        label: `Мои паки (${packs.length})` },
    { id: 'settings',     label: 'Настройки' },
  ];

  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div className="profile-layout">

        {/* SIDEBAR */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 32 Q4 22 18 22 Q32 22 32 32" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>

            {editing ? (
              <div style={{ width: '100%', marginBottom: 8 }}>
                <input
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--accent)', color: 'var(--text)', padding: '6px 10px', fontFamily: 'var(--mono)', fontSize: '0.85rem', outline: 'none', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, boxSizing: 'border-box' }}
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  maxLength={20}
                  onKeyDown={e => e.key === 'Enter' && saveUsername()}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button onClick={saveUsername} disabled={saving} style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, padding: '6px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer' }}>
                    {saving ? '...' : 'СОХРАНИТЬ'}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, padding: '6px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer' }}>
                    ОТМЕНА
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-username" onClick={() => setEditing(true)} style={{ cursor: 'pointer' }} title="Нажмите чтобы изменить">
                {profile?.username || 'ИГРОК'} ✎
              </div>
            )}

            <div className="profile-rank">{rank.icon} {rank.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginBottom: 12 }}>{user.email}</div>

            <div className="stats-grid mt-2">
              <div className="stat-cell"><span className="stat-cell-val">{stats.games}</span><span className="stat-cell-label">Игр</span></div>
              <div className="stat-cell"><span className="stat-cell-val">{stats.wins}</span><span className="stat-cell-label">Побед</span></div>
              <div className="stat-cell"><span className="stat-cell-val">{winRate}%</span><span className="stat-cell-label">Винрейт</span></div>
              <div className="stat-cell"><span className="stat-cell-val">{stats.survived}</span><span className="stat-cell-label">Выжил</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ textAlign: 'left', padding: '0.75rem 1rem', fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 1, background: activeTab === t.id ? 'var(--bg4)' : 'transparent', border: 'none', borderLeft: `3px solid ${activeTab === t.id ? 'var(--accent)' : 'transparent'}`, color: activeTab === t.id ? 'var(--accent)' : 'var(--text3)', cursor: 'pointer', transition: 'all 0.15s' }}>
                {t.label}
              </button>
            ))}
            <button onClick={handleLogout}
              style={{ textAlign: 'left', padding: '0.75rem 1rem', fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 1, background: 'transparent', border: 'none', borderLeft: '3px solid transparent', color: '#e06060', cursor: 'pointer', marginTop: '0.5rem' }}>
              ✕ Выйти из аккаунта
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>

          {/* STATS */}
          {activeTab === 'stats' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '1.5rem' }}>// СТАТИСТИКА</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  ['Всего игр',     stats.games,     '◉'],
                  ['Побед',         stats.wins,      '★'],
                  ['Выжил',         stats.survived,  '☢'],
                  ['Изгнан',        stats.eliminated,'✕'],
                  ['Винрейт',       winRate + '%',   '◈'],
                  ['Паков создано', packs.length,    '▦'],
                ].map(([label, val, icon]) => (
                  <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontFamily: 'var(--title)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.05em' }}>{val}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginTop: 4, letterSpacing: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* XP bar */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', marginBottom: 8 }}>
                  <span>{rank.icon} {rank.label}</span>
                  <span>{stats.games} игр</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.min(100, (stats.games / 100) * 100)}%`, transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginTop: 6 }}>
                  До следующего ранга: {Math.max(0, ([...RANKS].find(r => r.min > stats.games)?.min ?? 999) - stats.games)} игр
                </div>
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '1.5rem' }}>// ДОСТИЖЕНИЯ</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {ACHIEVEMENTS.map(a => {
                  const earned = (stats[a.key] || 0) >= a.threshold;
                  return (
                    <div key={a.id} style={{ background: 'var(--bg2)', border: `1px solid ${earned ? 'var(--accent)' : 'var(--border)'}`, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: earned ? 1 : 0.45, filter: earned ? 'none' : 'grayscale(1)' }}>
                      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{a.icon}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--title)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: 1, color: earned ? 'var(--accent)' : 'var(--text3)', marginBottom: 2 }}>{a.name}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>{a.desc}</div>
                        {!earned && <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text3)', marginTop: 4 }}>{stats[a.key] || 0}/{a.threshold}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PACKS */}
          {activeTab === 'packs' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)' }}>// МОИ ПАКИ КАРТОЧЕК</div>
                <button onClick={() => navigate('editor')} style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, padding: '8px 18px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>
                  + СОЗДАТЬ ПАК
                </button>
              </div>
              {packs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text3)', border: '1px dashed var(--border)' }}>
                  // У вас пока нет паков карточек
                  <div style={{ marginTop: '1rem' }}>
                    <button onClick={() => navigate('editor')} style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2, padding: '8px 20px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer' }}>
                      Создать первый пак
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {packs.map(pack => (
                    <div key={pack.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--title)', fontSize: '0.95rem', fontWeight: 600, letterSpacing: 1, color: 'var(--text)', marginBottom: 2 }}>{pack.name}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>
                          {pack.cardCount || 0} карточек · {pack.public ? '🌐 Публичный' : '🔒 Приватный'} · {pack.plays || 0} использований
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => navigate('editor', { packId: pack.id })} style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, padding: '6px 12px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer' }}>
                          ИЗМЕНИТЬ
                        </button>
                        <button onClick={() => handleDeletePack(pack.id)} style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, padding: '6px 12px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#e06060', cursor: 'pointer' }}>
                          УДАЛИТЬ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 560 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '1.5rem' }}>// НАСТРОЙКИ</div>

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, color: 'var(--text2)', marginBottom: '1rem' }}>ЦВЕТОВАЯ ТЕМА</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {THEMES.map(t => (
                    <div key={t.id} onClick={() => applyTheme(t.id)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <div style={{ width: 40, height: 40, background: t.color, border: `3px solid ${settings.theme === t.id ? (t.id === 'light' ? '#7a5c1e' : 'white') : (t.id === 'light' ? '#c8c4b8' : 'transparent')}`, borderRadius: 2, transition: 'border 0.2s', boxShadow: t.id === 'light' ? '0 0 0 1px #c0bcac' : 'none' }} />
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: settings.theme === t.id ? 'var(--accent)' : 'var(--text3)' }}>{t.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, color: 'var(--text2)', marginBottom: '1rem' }}>РАЗМЕР ШРИФТА</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="range" min="13" max="20" value={settings.fontSize || 16} onChange={e => applyFontSize(e.target.value)} style={{ flex: 1 }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--accent)', minWidth: 40 }}>{settings.fontSize || 16}px</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, color: 'var(--text2)', marginBottom: '1rem' }}>АККАУНТ</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: 8 }}>Email: {user.email}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: 16 }}>UID: {user.uid.slice(0, 12)}...</div>
                <button onClick={handleLogout} style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, padding: '8px 20px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#e06060', cursor: 'pointer' }}>
                  ✕ ВЫЙТИ ИЗ АККАУНТА
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
