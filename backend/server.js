const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory data store
let poll = null; // only one active poll at a time for this simple assignment
let students = {}; // socketId -> { name }

function createPoll({ question, options, duration = 60 }) {
  poll = {
    id: Date.now().toString(),
    question,
    options: options.map((o, i) => ({ id: i, text: o })),
    votes: options.map(() => 0),
    active: true,
    startedAt: Date.now(),
    duration: parseInt(duration, 10) || 60,
    answered: new Set()
  };

  // Schedule poll end
  setTimeout(() => {
    if (poll && poll.active) {
      endPoll();
    }
  }, poll.duration * 1000);

  return poll;
}

function endPoll() {
  if (!poll) return;
  poll.active = false;
  // send results
  io.emit('server:poll_ended', {
    poll: serializePoll(poll)
  });
}

function serializePoll(p) {
  return {
    id: p.id,
    question: p.question,
    options: p.options,
    votes: p.votes,
    active: p.active,
    duration: p.duration,
    startedAt: p.startedAt,
    totalAnswered: p.answered.size
  };
}

// REST endpoints (optional)
app.get('/poll', (req, res) => {
  if (!poll) return res.json({ poll: null });
  res.json({ poll: serializePoll(poll) });
});

app.post('/poll/create', (req, res) => {
  const { question, options, duration } = req.body;
  if (poll && poll.active) {
    return res.status(400).json({ error: 'Active poll exists' });
  }
  const p = createPoll({ question, options, duration });
  io.emit('server:new_poll', { poll: serializePoll(p) });
  res.json({ poll: serializePoll(p) });
});

app.post('/poll/end', (req, res) => {
  if (!poll) return res.status(400).json({ error: 'No poll' });
  endPoll();
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // Student/Teacher registers
  socket.on('client:join', ({ role, name }) => {
    students[socket.id] = { name, role };
    socket.emit('server:joined', { id: socket.id, role, name });
    // send current poll state
    if (poll) {
      socket.emit('server:new_poll', { poll: serializePoll(poll) });
    }
    io.emit('server:students_update', { count: Object.keys(students).length });
  });

  socket.on('student:submit', ({ optionId }) => {
    if (!poll || !poll.active) {
      socket.emit('server:error', { message: 'No active poll' });
      return;
    }
    // prevent double answer per socket
    if (poll.answered.has(socket.id)) {
      socket.emit('server:error', { message: 'Already answered' });
      return;
    }

    poll.votes[optionId] = (poll.votes[optionId] || 0) + 1;
    poll.answered.add(socket.id);

    // broadcast updated results
    io.emit('server:update_results', { poll: serializePoll(poll) });

    // If all connected students have answered, and there is at least one student, end poll early
    const connectedStudentSockets = Object.entries(students)
      .filter(([sid, s]) => s.role === 'student')
      .map(([sid]) => sid);

    const allAnswered = connectedStudentSockets.length > 0 && connectedStudentSockets.every(sid => poll.answered.has(sid));
    if (allAnswered) {
      endPoll();
    }
  });

  socket.on('teacher:create_poll', ({ question, options, duration }) => {
    if (poll && poll.active) {
      socket.emit('server:error', { message: 'An active poll already exists' });
      return;
    }
    const p = createPoll({ question, options, duration });
    io.emit('server:new_poll', { poll: serializePoll(p) });
  });

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    delete students[socket.id];
    io.emit('server:students_update', { count: Object.keys(students).length });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Server listening on', PORT);
});
