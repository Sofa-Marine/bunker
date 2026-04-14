import { NEWS_ITEMS } from '../data';

const TOP_PACKS = ['Ядерный апокалипсис', 'Пандемия 2026', 'Зомби World', 'Фэнтези бункер'];
const LEADERBOARD = ['ALEKSEI_V', 'MASHA_K', 'DARK_ONE', 'VLAD_S', 'NINA_R'];

export default function NewsPage() {
  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div className="section-label">// НОВОСТИ И ОБНОВЛЕНИЯ</div>
          <div className="section-title">Журнал Бункера</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* MAIN COLUMN */}
          <div>
            {/* FEATURED */}
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              padding: '2rem', marginBottom: '1.5rem', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:3, textTransform:'uppercase', color:'var(--accent)', marginBottom:'0.5rem' }}>
                // КРУПНОЕ ОБНОВЛЕНИЕ
              </div>
              <div style={{ fontFamily:'var(--title)', fontSize:'1.5rem', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--text)', marginBottom:'0.75rem', lineHeight:1.2 }}>
                Обновление 1.0 — Сценарии и Редактор Бункера
              </div>
              <div style={{ fontSize:'0.9rem', color:'var(--text2)', lineHeight:1.7, marginBottom:'1rem' }}>
                Теперь создатели паков могут полностью настраивать параметры бункера, задавать сценарии катастроф и добавлять уникальные события. Финальный тест выживания учитывает все характеристики отряда.
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--text3)', letterSpacing:1 }}>
                12 апреля 2026 · РАЗРАБОТКА
              </div>
            </div>

            {/* NEWS LIST */}
            {NEWS_ITEMS.map((n, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem 0', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'padding-left 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.paddingLeft='0.5rem'}
                onMouseLeave={e => e.currentTarget.style.paddingLeft='0'}
              >
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:2, textTransform:'uppercase', color:'var(--accent)', marginBottom:3 }}>
                  {n.cat}
                </div>
                <div style={{ fontFamily:'var(--title)', fontSize:'0.9rem', fontWeight:600, letterSpacing:1, textTransform:'uppercase', color:'var(--text)', marginBottom:3 }}>
                  {n.title}
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'var(--text3)' }}>{n.date}</div>
              </div>
            ))}
          </div>

          {/* SIDEBAR */}
          <div>
            {/* TOP PACKS */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', padding:'1.25rem', marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:3, textTransform:'uppercase', color:'var(--text3)', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border)', marginBottom:'1rem' }}>
                // ТОП ПАКИ НЕДЕЛИ
              </div>
              {TOP_PACKS.map((n, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                  <span style={{ color:'var(--text2)' }}>
                    <span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--accent)', marginRight:8 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {n}
                  </span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
                    {Math.floor(Math.random() * 500 + 100)} игр
                  </span>
                </div>
              ))}
            </div>

            {/* LEADERBOARD */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', padding:'1.25rem' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:3, textTransform:'uppercase', color:'var(--text3)', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border)', marginBottom:'1rem' }}>
                // ТАБЛИЦА ЛИДЕРОВ
              </div>
              {LEADERBOARD.map((n, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                  <span style={{ color:'var(--text2)' }}>
                    <span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color: i === 0 ? 'var(--accent)' : 'var(--text3)', marginRight:8 }}>
                      #{i + 1}
                    </span>
                    {n}
                  </span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--accent)' }}>
                    {(5000 - i * 600).toLocaleString('ru')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
