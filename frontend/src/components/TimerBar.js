import React from 'react';

export default function TimerBar({ secondsLeft, total }) {
  const pct = Math.max(0, Math.min(100, Math.round((secondsLeft / total) * 100)));
  return (
    <div className="timer">
      <div className="timer-bar">
        <div className="timer-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="timer-text">{secondsLeft}s</div>
    </div>
  );
}
