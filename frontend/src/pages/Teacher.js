import React, { useEffect, useState } from 'react';
import socket from '../socket';
import PollResults from '../components/PollResults';

export default function Teacher() {
  const [question, setQuestion] = useState('');
  const [optionsText, setOptionsText] = useState('Yes\nNo');
  const [duration, setDuration] = useState(60);
  const [poll, setPoll] = useState(null);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    socket.emit('client:join', { role: 'teacher', name: 'Teacher' });
    socket.on('server:new_poll', ({ poll }) => setPoll(poll));
    socket.on('server:update_results', ({ poll }) => setPoll(poll));
    socket.on('server:poll_ended', ({ poll }) => setPoll(poll));
    socket.on('server:students_update', ({ count }) => setStudentsCount(count));
    return () => {
      socket.off('server:new_poll');
      socket.off('server:update_results');
      socket.off('server:poll_ended');
      socket.off('server:students_update');
    };
  }, []);

  function createPoll(e) {
    e.preventDefault();
    const opts = optionsText.split('\n').map(s => s.trim()).filter(Boolean);
    if (!question || opts.length < 2) return alert('Provide question and at least 2 options');
    socket.emit('teacher:create_poll', { question, options: opts, duration });
  }

  return (
    <div className="teacher-page">
      <h2>Teacher Dashboard</h2>
      <div>Connected users: {studentsCount}</div>

      <form onSubmit={createPoll} className="poll-form">
        <label>Question</label>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} />
        <label>Options (one per line)</label>
        <textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} rows={4} />
        <label>Duration (seconds)</label>
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <button type="submit">Create Poll</button>
      </form>

      {poll ? (
        <div className="poll-area">
          <h3>Active Poll</h3>
          <div><strong>{poll.question}</strong></div>
          <PollResults poll={poll} showCounts={true} />
        </div>
      ) : (
        <div>No active poll</div>
      )}
    </div>
  );
}
