import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const API_URL = 'http://localhost:8080/api/usuarios/login';

    try {
      const response = await axios.post(API_URL, {
        email,
        contrasena: password,
      });

      if (response.status === 200) {
        const { id, nombre } = response.data;

        // Almacenar el ID del usuario y el nombre en el localStorage
        localStorage.setItem('usuarioId', id);
        localStorage.setItem('usuarioNombre', nombre);  // Guardar el nombre del usuario

        // Redirigir al catálogo
        navigate('/catalogo');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const usuarioId = localStorage.getItem('usuarioId');
    if (token && usuarioId) {
      navigate('/catalogo');
    }
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Iniciar Sesión</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
          <div className="mt-3 text-center">
            <Link to="/crearcuenta" className="d-block mt-2">¿No tienes cuenta? Crea una aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
