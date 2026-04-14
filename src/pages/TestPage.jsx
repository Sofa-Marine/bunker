import { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { advancePhase } from '../firebase';

const TEST_QUESTIONS = [
  { q:'Среди выживших есть медицинский работник?', options:['Да, профессиональный врач','Есть базовые знания медицины','Нет медицинских навыков'], scores:[3,1,-2] },
  { q:'Насколько сбалансирован состав по возрасту?', options:['Есть молодые и опытные (20–50 лет)','В основном молодёжь до 25 лет','Преимущественно старше 55 лет'], scores:[2,0,-1] },
  { q:'Есть сельскохозяйственные навыки?', options:['Агроном или фермер в группе','Базовые знания о выращивании','Никто не занимался сельским хозяйством'], scores:[3,1,-1] },
  { q:'Психологическая совместимость группы?', options:['Нет острых конфликтов','Небольшие разногласия','Серьёзные конфликты'], scores:[2,0,-3] },
  { q:'Есть инженерные или технические навыки?', options:['Инженер или техник','Кто-то разбирается в технике','Никаких технических навыков'], scores:[2,1,-1] },
  { q:'Физическое состояние группы?', options:['Все в хорошей форме','1–2 человека с ограничениями','Несколько тяжелобольных'], scores:[1,0,-2] },
];

function getVerdict(score, max) {
  const pct = score / max;
  if (pct >= 0.8) return { label:'ОТЛИЧНЫЙ СОСТАВ', desc:'Ваша группа имеет все шансы на выживание. Высокий потенциал для восстановления цивилизации.', color:'var(--accent)' };
  if (pct >= 0.5) return { label:'УДОВЛЕТВОРИТЕЛЬНО', desc:'Группа способна выжить, но есть серьёзные пробелы. Предстоит много трудностей.', color:'#f0b040' };
  if (pct >= 0.2) return { label:'КРИТИЧЕСКАЯ СИТУАЦИЯ', desc:'Шансы на долгосрочное выживание невысоки. Группа столкнётся с серьёзными проблемами.', color:'#e06060' };
  return { label:'КАТАСТРОФА', desc:'Состав группы крайне неудачен. Выживание маловероятно.', color:'#c0392b' };
}

export default function TestPage({ navigate, gameState }) {
  const showToast = useToast();
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  function answer(qi, oi) {
    setAnswers(prev => ({ ...prev, [qi]: oi }));
  }

  function submit() {
    if (Object.keys(answers).length < TEST_QUESTIONS.length) {
      showToast('Ответьте на все вопросы!', 'danger'); return;
    }
    setDone(true);
  }

  const totalScore = Object.entries(answers).reduce((sum, [qi, oi]) => sum + TEST_QUESTIONS[qi].scores[oi], 0);
  const maxScore = TEST_QUESTIONS.reduce((sum, q) => sum + Math.max(...q.scores), 0);
  const verdict = getVerdict(totalScore, maxScore);
  const progress = Math.round((Object.keys(answers).length / TEST_QUESTIONS.length) * 100);

  return (
    <div className="page-wrapper" style={{ minHeight:'calc(100vh - 56px)', background:'var(--bg)', padding:'2rem 1.5rem' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>

        {!done ? (
          <>
            <div style={{ marginBottom:'2rem', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:4, color:'var(--accent)', marginBottom:8 }}>// ФИНАЛЬНЫЙ ТЕСТ</div>
              <div style={{ fontFamily:'var(--title)', fontSize:'1.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)', marginBottom:12 }}>ОЦЕНКА ГРУППЫ</div>
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', height:4, borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'var(--accent)', width:`${progress}%`, transition:'width 0.3s' }} />
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--text3)', marginTop:4 }}>{Object.keys(answers).length}/{TEST_QUESTIONS.length} вопросов</div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {TEST_QUESTIONS.map((q, qi) => (
                <div key={qi} style={{ background:'var(--bg2)', border:`1px solid ${answers[qi]!==undefined ? 'var(--border2)' : 'var(--border)'}`, padding:'1.25rem', transition:'border-color 0.2s' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:2, color:'var(--accent)', marginBottom:6 }}>ВОПРОС {qi+1}</div>
                  <div style={{ color:'var(--text)', fontSize:'0.95rem', lineHeight:1.5, marginBottom:'1rem' }}>{q.q}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} onClick={() => answer(qi, oi)}
                        style={{ padding:'0.75rem 1rem', background: answers[qi]===oi ? 'rgba(200,168,75,0.1)' : 'var(--bg3)', border:`1px solid ${answers[qi]===oi ? 'var(--accent)' : 'var(--border)'}`, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.75rem', transition:'all 0.15s' }}
                        onMouseEnter={e => { if(answers[qi]!==oi) e.currentTarget.style.borderColor='var(--accent)'; }}
                        onMouseLeave={e => { if(answers[qi]!==oi) e.currentTarget.style.borderColor='var(--border)'; }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${answers[qi]===oi ? 'var(--accent)' : 'var(--border2)'}`, background: answers[qi]===oi ? 'var(--accent)' : 'transparent', flexShrink:0, transition:'all 0.15s' }} />
                        <div style={{ color: answers[qi]===oi ? 'var(--text)' : 'var(--text2)', fontSize:'0.85rem' }}>{opt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign:'center', marginTop:'2rem' }}>
              <button onClick={submit} style={{ fontFamily:'var(--mono)', fontSize:'0.75rem', letterSpacing:3, padding:'12px 40px', background:'var(--accent)', border:'1px solid var(--accent)', color:'var(--bg)', cursor:'pointer', fontWeight:'bold' }}>
                ПОЛУЧИТЬ РЕЗУЛЬТАТ
              </button>
            </div>
          </>
        ) : (
          <div style={{ animation:'fadeIn 0.5s ease', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:4, color:'var(--text3)', marginBottom:12 }}>// РЕЗУЛЬТАТ ИГРЫ</div>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>
              {totalScore >= maxScore*0.8 ? '🏆' : totalScore >= maxScore*0.5 ? '⚠️' : '☠️'}
            </div>
            <div style={{ fontFamily:'var(--title)', fontSize:'2rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:verdict.color, marginBottom:'1rem' }}>{verdict.label}</div>

            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', padding:'1.5rem', marginBottom:'2rem', maxWidth:520, margin:'0 auto 2rem' }}>
              <p style={{ color:'var(--text2)', lineHeight:1.7, margin:0 }}>{verdict.desc}</p>
            </div>

            {/* Score bar */}
            <div style={{ maxWidth:420, margin:'0 auto 2rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--text3)', marginBottom:6 }}>
                <span>ОЧКИ ВЫЖИВАЕМОСТИ</span>
                <span style={{ color:verdict.color }}>{totalScore}/{maxScore}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width:`${Math.max(0,(totalScore/maxScore)*100)}%`, background:verdict.color, transition:'width 1.5s ease' }} />
              </div>
            </div>

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate('lobby')} style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', letterSpacing:2, padding:'10px 24px', background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text2)', cursor:'pointer' }}>
                ← В ЛОББИ
              </button>
              <button onClick={() => { navigate('roomWaiting', { isHost:true, roomName:'БУНКЕР А-7', maxPlayers:8 }); }} style={{ fontFamily:'var(--mono)', fontSize:'0.75rem', letterSpacing:3, padding:'10px 28px', background:'var(--accent)', border:'1px solid var(--accent)', color:'var(--bg)', cursor:'pointer', fontWeight:'bold' }}>
                ▶ НОВАЯ ИГРА
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
