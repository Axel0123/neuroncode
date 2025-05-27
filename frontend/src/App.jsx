import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Editor from './Editor';
import History from './History';
import Navbar from './Navbar';
import SharedView from './SharedView';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/editor" element={<Editor />} />
        <Route
          path="/history"
          element={
            <History
              onReRun={(code) => {
                localStorage.setItem("codeToRun", code);
                window.location.href = "/editor";
              }}
            />
          }
        />
        <Route path="/shared/:id" element={<SharedView />} />
      </Routes>
    </Router>
  );
}
