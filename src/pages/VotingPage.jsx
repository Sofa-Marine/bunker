import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import {
  auth,
  listenPlayers, listenVotes, listenRoom,
  castVote, clearVotes, advancePhase,
  updateRoom,
} from '../firebase';

export default function VotingPage({ navigate, gameState }) {
  const showToast = useToast();
  const isHost  = gameState?.isHost ?? true;
  const roomId  = gameState?.roomId ?? null;
  const round   = gameState?.round  ?? 1;
  const myUid   = auth.currentUser?.uid;

  const [players, setPlayers]   = useState([]);
  const [votes, setVotes]       = useState({});   // uid -> uid
  const [myVote, setMyVote]     = useState(null);
  const [phase, setPhase]       = useState('voting'); // voting | result
  const [eliminated, setEliminated] = useState(null);

  // ── Listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const unsubPlayers = listenPlayers(roomId, setPlayers);
    const unsubVotes   = listenVotes(roomId, setVotes);

    // Non-host: listen for phase
    const unsubRoom = listenRoom(roomId, room => {
      if (!room) return;
      if (!isHost && room.phase === 'result') {
        setEliminated(room.eliminatedPlayer ?? null);
        setPhase('result');
      }
      if (!isHost && room.phase === 'game') {
        navigate('game', { ...gameState, round: room.round });
      }
      if (!isHost && room.phase === 'test') {
        navigate('test', gameState);
      }
    });

    return () => { unsubPlayers(); unsubVotes(); unsubRoom(); };
  }, [roomId]);

  async function handleVote(targetUid) {
    if (myVote || !roomId || !myUid) return;
    setMyVote(targetUid);
    await castVote(roomId, myUid, targetUid);
    showToast(`Голос подан за ${players.find(p => p.uid === targetUid)?.name}`, 'danger');
  }

  // Tally votes: uid -> count
  const tally = {};
  Object.values(votes).forEach(targetUid => {
    tally[targetUid] = (tally[targetUid] ?? 0) + 1;
  });

  const totalVoters = players.filter(p => !p.eliminated).length;
  const votedCount  = Object.keys(votes).length;
  const allVoted    = votedCount >= totalVoters && totalVoters > 0;

  async function revealResult() {
    if (!isHost || !roomId) return;
    // Find player with most votes
    const sorted = players
      .filter(p => !p.eliminated)
      .map(p => ({ ...p, voteCount: tally[p.uid] ?? 0 }))
      .sort((a, b) => b.voteCount - a.voteCount);
    const loser = sorted[0];
    setEliminated(loser);
    setPhase('result');
    // Mark as eliminated in Firebase, save result for non-hosts
    await advancePhase(roomId, 'result', { eliminatedPlayer: loser });
    await updateRoom(roomId, { [`players/${loser.uid}/eliminated`]: true });
  }

  async function nextRound() {
    if (!isHost || !roomId) return;
    const activePlayers = players.filter(p => !p.eliminated && p.uid !== eliminated?.uid);
    await clearVotes(roomId);
    // Reset ready states
    const updates = {};
    activePlayers.forEach(p => { updates[`players/${p.uid}/ready`] = false; updates[`players/${p.uid}/revealedCard`] = null; });
    await updateRoom(roomId, updates);

    if (activePlayers.length <= 3) {
      await advancePhase(roomId, 'test');
      navigate('test', gameState);
    } else {
      const newRound = round + 1;
      await advancePhase(roomId, 'game', { round: newRound });
      navigate('game', { ...gameState, round: newRound });
    }
  }

  const activePlayers = players.filter(p => !p.eliminated);
  const sortedByVotes = [...activePlayers].map(p => ({ ...p, voteCount: tally[p.uid] ?? 0 })).sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="page-wrapper" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 760, width: '100%' }}>

        {phase === 'voting' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 4, color: 'var(--accent)', marginBottom: 8 }}>// РАУНД {round} — ГОЛОСОВАНИЕ</div>
              <div style={{ fontFamily: 'var(--title)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>КОГО ИЗГНАТЬ?</div>
              <div style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '0.7rem', marginTop: 8 }}>
                Проголосовало: {votedCount} / {totalVoters}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {activePlayers.filter(p => p.uid !== myUid).map(p => (
                <div key={p.uid} onClick={() => handleVote(p.uid)}
                  style={{ background: myVote === p.uid ? 'rgba(192,57,43,0.1)' : 'var(--bg2)', border: `1px solid ${myVote === p.uid ? '#c0392b' : 'var(--border)'}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: myVote ? 'default' : 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!myVote) e.currentTarget.style.borderColor = '#c0392b'; }}
                  onMouseLeave={e => { if (myVote !== p.uid) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)', flexShrink: 0 }}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--title)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', marginTop: 2 }}>{p.revealedCard ?? 'Не раскрыл карту'}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', padding: '4px 12px', background: myVote === p.uid ? 'rgba(192,57,43,0.2)' : 'var(--bg3)', border: `1px solid ${myVote === p.uid ? 'rgba(192,57,43,0.4)' : 'var(--border)'}`, color: myVote === p.uid ? '#e06060' : 'var(--text3)' }}>
                    {myVote === p.uid ? '✓ ВАШ ГОЛОС' : tally[p.uid] ? `${tally[p.uid]} голос(а)` : 'ИЗГНАТЬ'}
                  </div>
                </div>
              ))}
            </div>

            {/* Vote progress bars */}
            {Object.keys(tally).length > 0 && (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 3, color: 'var(--text3)', marginBottom: '0.75rem' }}>// ТЕКУЩИЙ СЧЁТ</div>
                {sortedByVotes.filter(p => p.voteCount > 0).map(p => (
                  <div key={p.uid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', minWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ flex: 1, background: 'var(--bg3)', height: 6 }}>
                      <div style={{ height: '100%', background: '#e06060', width: `${(p.voteCount / totalVoters) * 100}%`, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: '#e06060', minWidth: 20 }}>{p.voteCount}</div>
                  </div>
                ))}
              </div>
            )}

            {isHost ? (
              <div style={{ textAlign: 'center' }}>
                <button onClick={revealResult} disabled={!allVoted}
                  style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '12px 36px', background: allVoted ? '#c0392b' : 'var(--bg3)', border: `1px solid ${allVoted ? '#c0392b' : 'var(--border)'}`, color: allVoted ? '#fff' : 'var(--text3)', cursor: allVoted ? 'pointer' : 'not-allowed', fontWeight: 'bold', transition: 'all 0.2s' }}>
                  {allVoted ? 'ОБЪЯВИТЬ РЕЗУЛЬТАТ' : `ОЖИДАНИЕ ГОЛОСОВ (${votedCount}/${totalVoters})`}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', padding: '12px', border: '1px solid var(--border)' }}>
                {myVote ? '⏳ ОЖИДАНИЕ ДРУГИХ ИГРОКОВ...' : '← ПРОГОЛОСУЙТЕ ВЫШЕ'}
              </div>
            )}
          </div>
        )}

        {phase === 'result' && eliminated && (
          <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 4, color: '#e06060', marginBottom: 12 }}>// ИЗГНАН ИЗ БУНКЕРА</div>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(192,57,43,0.15)', border: '2px solid #c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '1.2rem', color: '#e06060', margin: '0 auto 1rem' }}>
              {eliminated.avatar}
            </div>
            <div style={{ fontFamily: 'var(--title)', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e06060', marginBottom: 4 }}>{eliminated.name}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>{eliminated.voteCount} голоса против</div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '2rem', display: 'inline-block', minWidth: 320 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: '0.75rem' }}>ПОСЛЕДНЯЯ РАСКРЫТАЯ КАРТА</div>
              <div style={{ fontFamily: 'var(--title)', fontSize: '1rem', color: 'var(--text)' }}>{eliminated.revealedCard ?? 'Не раскрыл'}</div>
            </div>

            {isHost ? (
              <div>
                <button onClick={nextRound} style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, padding: '12px 36px', background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 'bold' }}>
                  ▶ СЛЕДУЮЩИЙ РАУНД
                </button>
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', padding: '12px 24px', border: '1px solid var(--border)', display: 'inline-block' }}>
                ⏳ ОЖИДАНИЕ ХОСТА...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
