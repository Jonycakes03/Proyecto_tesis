import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../app.css';

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await register(name, email, password);
            // Tras registro exitoso, redirigir al editor
            navigate('/');
        } catch (err) {
            console.error(err.code, err.message);
            if (err.code === 'auth/weak-password') {
                setError("La contraseña es muy débil. Debe tener al menos 6 caracteres.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Este correo ya está registrado.");
            } else if (err.code === 'auth/invalid-email') {
                setError("El correo electrónico no es válido.");
            } else {
                setError("Error al registrarse: " + err.message);
            }
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
            <div style={{ maxWidth: '400px', width: '90%', background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#111827' }}>Crear Cuenta</h2>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu Nombre"
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Registrarse
                    </button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#4f46e5' }}>Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
}
