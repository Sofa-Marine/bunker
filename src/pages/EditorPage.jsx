import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { createPack, updatePack, getPack } from '../firebase';
import { CATEGORIES } from '../data';

const DEFAULT_CARDS = {
  professions: ['Хирург','Инженер-ядерщик','Агроном','Военный снайпер','Психолог','Повар','Электрик'],
  health:      ['Абсолютно здоров','Диабет 1 типа','Аллергия на пыль','Ночная слепота'],
  phobia:      ['Клаустрофобия','Агорафобия','Арахнофобия','Нет фобий'],
  hobby:       ['Садоводство','Боевые искусства','Медитация','Охота','Кулинария'],
  baggage:     ['АК-47 с 3 магазинами','Аптечка','Семена растений','Ноутбук с энциклопедией'],
  fact:        ['Бывший военный','Знает 5 языков','Вырос в деревне','Чёрный пояс по карате'],
  action:      ['Может убедить группу','Меняет профессию','Спасает изгнанного'],
  age:         ['18 лет','25 лет','34 года','45 лет','52 года'],
  gender:      ['Мужчина','Женщина','Не бинарный'],
};

export default function EditorPage({ navigate, gameState }) {
  const showToast = useToast();
  const { user } = useAuth();
  const editPackId = gameState?.packId ?? null;

  const [packName,    setPackName]    = useState('Мой пак');
  const [packDesc,    setPackDesc]    = useState('');
  const [isPublic,    setIsPublic]    = useState(true);
  const [activeCat,   setActiveCat]   = useState('professions');
  const [cards,       setCards]       = useState(DEFAULT_CARDS);
  const [newCard,     setNewCard]     = useState('');
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState('cards');

  // Scenario settings
  const [scenario,    setScenario]    = useState('Ядерная война');
  const [bunkerName,  setBunkerName]  = useState('Бункер А-7');
  const [survivors,   setSurvivors]   = useState(5);
  const [foodMonths,  setFoodMonths]  = useState(24);
  const [waterMonths, setWaterMonths] = useState(18);
  const [area,        setArea]        = useState(200);
  const [rad,         setRad]         = useState(90);

  useEffect(() => {
    if (!editPackId) return;
    getPack(editPackId).then(pack => {
      if (!pack) return;
      setPackName(pack.name || 'Мой пак');
      setPackDesc(pack.desc || '');
      setIsPublic(pack.public ?? true);
      if (pack.cards) setCards(pack.cards);
      if (pack.scenario) {
        setScenario(pack.scenario.name || 'Ядерная война');
        setBunkerName(pack.scenario.bunker || 'Бункер А-7');
        setSurvivors(pack.scenario.survivors || 5);
        setFoodMonths(pack.scenario.food || 24);
        setWaterMonths(pack.scenario.water || 18);
        setArea(pack.scenario.area || 200);
        setRad(pack.scenario.radiation || 90);
      }
    });
  }, [editPackId]);

  function addCard() {
    if (!newCard.trim()) return;
    setCards(prev => ({ ...prev, [activeCat]: [...(prev[activeCat] || []), newCard.trim()] }));
    setNewCard('');
    showToast('Карточка добавлена');
  }

  function deleteCard(catId, idx) {
    setCards(prev => ({ ...prev, [catId]: prev[catId].filter((_, i) => i !== idx) }));
  }

  function editCard(catId, idx, val) {
    setCards(prev => ({ ...prev, [catId]: prev[catId].map((c, i) => i === idx ? val : c) }));
  }

  const totalCards = Object.values(cards).reduce((s, arr) => s + (arr?.length || 0), 0);

  async function handleSave() {
    if (!user) { showToast('Войдите чтобы сохранить пак', 'danger'); return; }
    if (!packName.trim()) { showToast('Введите название пака', 'danger'); return; }
    setSaving(true);
    try {
      const packData = {
        name:      packName.trim(),
        desc:      packDesc.trim(),
        public:    isPublic,
        cards,
        cardCount: totalCards,
        scenario: { name: scenario, bunker: bunkerName, survivors, food: foodMonths, water: waterMonths, area, radiation: rad },
      };
      if (editPackId) {
        await updatePack(editPackId, packData);
        showToast('Пак обновлён!', 'success');
      } else {
        await createPack(user.uid, packData);
        showToast('Пак создан!', 'success');
      }
      navigate('profile');
    } catch (e) {
      showToast('Ошибка сохранения', 'danger');
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { id: 'cards',    label: 'Карточки' },
    { id: 'scenario', label: 'Сценарий' },
    { id: 'settings', label: 'Настройки пака' },
  ];

  return (
    <div className="page-wrapper">
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', minHeight: 'calc(100vh - 56px)' }}>

        {/* SIDEBAR — categories */}
        <div style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '1.25rem', overflowY: 'auto' }}>
          <div className="sidebar-title">// КАТЕГОРИИ</div>
          {CATEGORIES.map(cat => (
            <div key={cat.id} onClick={() => { setActiveCat(cat.id); setActiveTab('cards'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: activeCat === cat.id && activeTab === 'cards' ? 'var(--accent)' : 'var(--text2)', background: activeCat === cat.id && activeTab === 'cards' ? 'var(--bg4)' : 'transparent', borderLeft: activeCat === cat.id && activeTab === 'cards' ? '3px solid var(--accent)' : '3px solid transparent', transition: 'all 0.15s' }}>
              <span>{cat.name}</span>
              <span style={{ color: 'var(--text3)', fontSize: '0.6rem' }}>{cards[cat.id]?.length || 0}</span>
            </div>
          ))}
          <div style={{ padding: '1rem 0', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
            Итого: {totalCards} карточек
          </div>
        </div>

        {/* CENTER */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: '0.6rem 1.25rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? 'var(--accent)' : 'transparent'}`, color: activeTab === t.id ? 'var(--accent)' : 'var(--text3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* CARDS tab */}
          {activeTab === 'cards' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '1rem' }}>
                // {CATEGORIES.find(c => c.id === activeCat)?.name?.toUpperCase()} — {cards[activeCat]?.length || 0} карточек
              </div>

              {/* Add card */}
              <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
                <input
                  style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '9px 14px', fontFamily: 'var(--mono)', fontSize: '0.8rem', outline: 'none' }}
                  placeholder="Новая карточка..."
                  value={newCard}
                  onChange={e => setNewCard(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCard()}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
                <button onClick={addCard} style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 2, padding: '9px 20px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>
                  + ДОБАВИТЬ
                </button>
              </div>

              {/* Cards list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(cards[activeCat] || []).map((card, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg2)', border: '1px solid var(--border)', padding: '0.6rem 0.875rem' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.55rem', color: 'var(--text3)', minWidth: 24 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <input
                      style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.8rem', outline: 'none' }}
                      value={card}
                      onChange={e => editCard(activeCat, i, e.target.value)}
                    />
                    <button onClick={() => deleteCard(activeCat, i)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px', lineHeight: 1 }}
                      onMouseEnter={e => e.target.style.color = '#e06060'}
                      onMouseLeave={e => e.target.style.color = 'var(--text3)'}>
                      ✕
                    </button>
                  </div>
                ))}
                {(!cards[activeCat] || cards[activeCat].length === 0) && (
                  <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', border: '1px dashed var(--border)' }}>
                    // Нет карточек в этой категории
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCENARIO tab */}
          {activeTab === 'scenario' && (
            <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 500 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '1.5rem' }}>// НАСТРОЙКИ СЦЕНАРИЯ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[['Название сценария', scenario, setScenario, 'Ядерная война'], ['Название бункера', bunkerName, setBunkerName, 'Бункер А-7']].map(([label, val, setter, ph]) => (
                  <div key={label}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>{label.toUpperCase()}</div>
                    <input style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '9px 14px', fontFamily: 'var(--mono)', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                      value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
                  </div>
                ))}
                {[['Мест в бункере', survivors, setSurvivors, 2, 20], ['Запасы еды (мес.)', foodMonths, setFoodMonths, 1, 120], ['Запасы воды (мес.)', waterMonths, setWaterMonths, 1, 60], ['Площадь (м²)', area, setArea, 50, 5000], ['Радиация снаружи (%)', rad, setRad, 0, 100]].map(([label, val, setter, min, max]) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', marginBottom: 6, letterSpacing: 2 }}>
                      <span>{label.toUpperCase()}</span><span style={{ color: 'var(--accent)' }}>{val}</span>
                    </div>
                    <input type="range" min={min} max={max} value={val} onChange={e => setter(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS tab */}
          {activeTab === 'settings' && (
            <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 500 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '1.5rem' }}>// НАСТРОЙКИ ПАКА</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>НАЗВАНИЕ ПАКА</div>
                  <input style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '9px 14px', fontFamily: 'var(--mono)', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                    value={packName} onChange={e => setPackName(e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>ОПИСАНИЕ</div>
                  <textarea style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '9px 14px', fontFamily: 'var(--mono)', fontSize: '0.75rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 }}
                    value={packDesc} onChange={e => setPackDesc(e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setIsPublic(p => !p)}>
                  <div style={{ width: 40, height: 22, background: isPublic ? 'var(--accent)' : 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 11, position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: isPublic ? 20 : 2, transition: 'left 0.2s' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text)' }}>{isPublic ? '🌐 Публичный пак' : '🔒 Приватный пак'}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>{isPublic ? 'Доступен всем игрокам' : 'Только для вас'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — preview + save */}
        <div style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)' }}>// ИНФОРМАЦИЯ</div>

          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--title)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{packName || 'Без названия'}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', marginBottom: 8 }}>{packDesc || 'Нет описания'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--accent)', padding: '2px 8px', border: '1px solid var(--accent)', opacity: 0.7 }}>{isPublic ? 'ПУБЛИЧНЫЙ' : 'ПРИВАТНЫЙ'}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)', padding: '2px 8px', border: '1px solid var(--border)' }}>{totalCards} карт</span>
            </div>
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)' }}>// КАТЕГОРИИ</div>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.65rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text2)' }}>{cat.name}</span>
              <span style={{ color: (cards[cat.id]?.length || 0) > 0 ? 'var(--accent)' : 'var(--text3)' }}>{cards[cat.id]?.length || 0}</span>
            </div>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!user && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: '#f0b040', padding: '0.5rem', background: 'rgba(240,176,64,0.08)', border: '1px solid rgba(240,176,64,0.2)' }}>
                ⚠ Войдите чтобы сохранить пак
              </div>
            )}
            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: '11px', fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: 3, background: saving ? 'var(--bg3)' : 'var(--accent)', border: `1px solid ${saving ? 'var(--border)' : 'var(--accent)'}`, color: saving ? 'var(--text3)' : 'var(--bg)', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {saving ? 'СОХРАНЕНИЕ...' : editPackId ? '✓ ОБНОВИТЬ ПАК' : '✓ СОХРАНИТЬ ПАК'}
            </button>
            <button onClick={() => navigate('profile')} style={{ width: '100%', padding: '9px', fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text3)', cursor: 'pointer' }}>
              ОТМЕНА
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
