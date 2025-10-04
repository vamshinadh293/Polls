import React from 'react';

export default function PollResults({ poll, showCounts = false }) {
  if (!poll) return null;
  const total = poll.votes.reduce((a, b) => a + b, 0) || 0;
  return (
    <div className="results">
      {poll.options.map((opt, i) => {
        const votes = poll.votes[i] || 0;
        const pct = total ? Math.round((votes / total) * 100) : 0;
        return (
          <div key={opt.id} className="result-row">
            <div className="result-label">{opt.text}</div>
            <div className="result-bar">
              <div className="result-fill" style={{ width: pct + '%' }} />
            </div>
            <div className="result-meta">{showCounts ? `${votes} votes` : `${pct}%`}</div>
          </div>
        );
      })}
    </div>
  );
}
