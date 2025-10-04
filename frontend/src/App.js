import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Teacher from './pages/Teacher';
import Student from './pages/Student';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Live Polling System</h1>
        <nav>
          <Link to="/teacher">Teacher</Link>
          <Link to="/student">Student</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
          <Route path="/" element={<div style={{padding:20}}>Open /teacher or /student</div>} />
        </Routes>
      </main>
    </div>
  );
}
