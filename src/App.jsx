import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ThesisEditor from './pages/ThesisEditor';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ThesisEditor />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

// --- SUBCOMPONENTS ---

function SectionBlock({ title, icon, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4 text-indigo-600">
        {icon}
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AutoTextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full bg-transparent border-none outline-none resize-none text-lg text-slate-700 placeholder:text-slate-300 leading-relaxed ${className}`}
      onInput={(e) => {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      rows={1}
      {...props}
    />
  );
}

function ExportButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}