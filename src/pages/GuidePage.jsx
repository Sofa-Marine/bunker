import { useRef } from 'react';
import { GUIDE_SECTIONS } from '../data';

export default function GuidePage({ navigate }) {
  const sectionRefs = useRef({});

  function scrollTo(id) {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div className="section-label">// ИНСТРУКЦИЯ К ВЫЖИВАНИЮ</div>
          <div className="section-title">Руководство Игрока</div>
        </div>

        {/* TABLE OF CONTENTS */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)', padding: '1.5rem', marginBottom: '2.5rem',
        }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', letterSpacing:3, textTransform:'uppercase', color:'var(--accent)', marginBottom:'1rem' }}>
            // СОДЕРЖАНИЕ
          </div>
          {GUIDE_SECTIONS.map((s, i) => (
            <div
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)',
                padding: '4px 0', cursor: 'pointer', textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text2)'}
            >
              <span style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>▶</span>
              {i + 1}. {s.title}
            </div>
          ))}
        </div>

        {/* SECTIONS */}
        {GUIDE_SECTIONS.map(s => (
          <div
            key={s.id}
            ref={el => sectionRefs.current[s.id] = el}
            style={{ marginBottom: '3rem', scrollMarginTop: '80px' }}
          >
            <div style={{
              fontFamily: 'var(--title)', fontSize: '1.5rem', fontWeight: 700,
              letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)',
              marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)',
            }}>
              {s.title}
            </div>
            <div dangerouslySetInnerHTML={{ __html: s.content }} />
            {/* Inject navigate for guide sections that link to other pages */}
            {s.id === 'g7' && (
              <button className="btn-main" style={{ marginTop: '1rem' }} onClick={() => navigate('test')}>
                Попробовать тест →
              </button>
            )}
            {s.id === 'g8' && (
              <button className="btn-main" style={{ marginTop: '1rem' }} onClick={() => navigate('editor')}>
                Открыть редактор →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
