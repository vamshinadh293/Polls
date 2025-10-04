import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';
import PollResults from '../components/PollResults';
import TimerBar from '../components/TimerBar';

export default function Student() {
  const [name, setName] = useState('');
  const [entered, setEntered] = useState(false);
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    socket.on('server:new_poll', ({ poll }) => {
      setPoll(poll);
      setSelected(null);
      setSubmitted(false);
      if (poll && poll.active) startTimer(poll);
    });
    socket.on('server:update_results', ({ poll }) => setPoll(poll));
    socket.on('server:poll_ended', ({ poll }) => {
      setPoll(poll);
      setTimeLeft(0);
    });
    return () => {
      socket.off('server:new_poll');
      socket.off('server:update_results');
      socket.off('server:poll_ended');
    };
  }, []);

  function join(e) {
    e.preventDefault();
    if (!name.trim()) return alert('Enter your name');
    setEntered(true);
    socket.emit('client:join', { role: 'student', name });
  }

  function submitAnswer() {
    if (selected === null) return alert('Choose an option');
    socket.emit('student:submit', { optionId: selected });
    setSubmitted(true);
  }

  function startTimer(poll) {
    clearInterval(timerRef.current);
    const startedAt = poll.startedAt || Date.now();
    const duration = poll.duration || 60;
    const endAt = startedAt + duration * 1000;
    function update() {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current);
      }
    }
    update();
    timerRef.current = setInterval(update, 500);
  }

  return (
    <div className="student-page">
      {!entered ? (
        <form onSubmit={join} className="join-form">
          <label>Enter your name (unique per tab)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit">Join</button>
        </form>
      ) : (
        <div>
          <h2>Welcome, {name}</h2>
          {poll && poll.active ? (
            <div className="poll-card">
              <div className="question">{poll.question}</div>
              {timeLeft !== null && <TimerBar secondsLeft={timeLeft} total={poll.duration} />}
              <div className="options">
                {poll.options.map(opt => (
                  <label key={opt.id} className={`option ${selected===opt.id? 'selected':''}`}>
                    <input type="radio" checked={selected===opt.id} onChange={() => setSelected(opt.id)} />
                    {opt.text}
                  </label>
                ))}
              </div>
              <div>
                <button onClick={submitAnswer} disabled={submitted}>Submit</button>
                {submitted && <span> — Thanks! Results below</span>}
              </div>
              {(!submitted) && timeLeft===0 && <div>Time's up — results shown</div>}
            </div>
          ) : poll && !poll.active ? (
            <div>
              <h3>Poll closed — results</h3>
              <PollResults poll={poll} showCounts={false} />
            </div>
          ) : (
            <div>No active poll right now — please wait.</div>
          )}

          {poll && (
            <div style={{marginTop:20}}>
              <h4>Live results (updated)</h4>
              <PollResults poll={poll} showCounts={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
