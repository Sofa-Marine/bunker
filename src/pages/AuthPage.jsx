import { useState } from 'react';
import { registerUser, loginUser } from '../firebase';
import { useToast } from '../hooks/useToast';

export default function AuthPage({ navigate }) {
  const showToast = useToast();
  const [mode, setMode]         = useState('login'); // login | register
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const ERRORS = {
    'auth/email-already-in-use': 'Email уже используется',
    'auth/invalid-email':        'Неверный формат email',
    'auth/weak-password':        'Пароль слишком простой (мин. 6 символов)',
    'auth/user-not-found':       'Пользователь не найден',
    'auth/wrong-password':       'Неверный пароль',
    'auth/invalid-credential':   'Неверный email или пароль',
    'auth/too-many-requests':    'Слишком много попыток. Попробуйте позже.',
  };

  async function handleSubmit() {
    setError('');
    if (!email || !password) { setError('Заполните все поля'); return; }
    if (mode === 'register' && !username.trim()) { setError('Введите никнейм'); return; }
    if (mode === 'register' && username.trim().length < 3) { setError('Никнейм минимум 3 символа'); return; }
    setLoading(true);
    try {
      if (mode === 'register') {
        await registerUser(email, password, username.trim());
        showToast('Добро пожаловать в бункер!', 'success');
      } else {
        await loginUser(email, password);
        showToast('Вход выполнен', 'success');
      }
      navigate('home');
    } catch (e) {
      setError(ERRORS[e.code] || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>☢</div>
          <div style={{ fontFamily: 'var(--title)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text)' }}>БУНКЕР</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 3, color: 'var(--text3)', marginTop: 4 }}>
            {mode === 'login' ? '// ВХОД В СИСТЕМУ' : '// РЕГИСТРАЦИЯ'}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '2rem' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, padding: '0.75rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase', background: 'transparent', border: 'none', borderBottom: `2px solid ${mode === m ? 'var(--accent)' : 'transparent'}`, color: mode === m ? 'var(--accent)' : 'var(--text3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {m === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>НИКНЕЙМ</div>
                <input
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase', letterSpacing: 1 }}
                  placeholder="ВЫЖИВШИЙ_01"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                  maxLength={20}
                />
              </div>
            )}

            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>EMAIL</div>
              <input
                type="email"
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="user@bunker.ru"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>ПАРОЛЬ</div>
              <input
                type="password"
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', padding: '0.75rem 1rem', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: '#e06060' }}>
                ✕ {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '12px', fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: 3, textTransform: 'uppercase', background: loading ? 'var(--bg3)' : 'var(--accent)', border: `1px solid ${loading ? 'var(--border)' : 'var(--accent)'}`, color: loading ? 'var(--text3)' : 'var(--bg)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s', marginTop: 4 }}>
              {loading ? '...' : mode === 'login' ? '▶ ВОЙТИ' : '▶ СОЗДАТЬ АККАУНТ'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text3)' }}>
          {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: 'var(--accent)', cursor: 'pointer', marginLeft: 6 }}>
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </span>
        </div>
      </div>
    </div>
  );
}
