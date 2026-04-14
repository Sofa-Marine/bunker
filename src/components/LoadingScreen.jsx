import { useState, useEffect } from 'react';

const MESSAGES = [
  'Инициализация систем...',
  'Загрузка протоколов...',
  'Подключение к серверу...',
  'Готово.',
];

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState(MESSAGES[0]);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + Math.random() * 25 + 5, 100);
        if (next < 30) setText(MESSAGES[0]);
        else if (next < 60) setText(MESSAGES[1]);
        else if (next < 90) setText(MESSAGES[2]);
        else setText(MESSAGES[3]);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFading(true);
            setTimeout(onDone, 500);
          }, 400);
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      id="loading-screen"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="loading-logo">БУНКЕР</div>
      <div className="loading-bar-wrap">
        <div className="loading-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-text">{text}</div>
    </div>
  );
}
