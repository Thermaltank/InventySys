import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "./usuarioService"; // Asegúrate de importar el servicio correcto

export const CrearCuenta = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Para redirigir a otra página tras el registro

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = { nombre, email, contrasena: password, esAdmin: false }; // Ajusta esto según el formato del backend

    try {
      // Llama a la función de creación del usuario
      const createdId = await createUser(userData);
      alert("Usuario creado con exito");
      // Redirige a la página de login
      navigate("/login");
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Crear una Cuenta</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              placeholder="Ingresa tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Crea una contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Registrarse</button>
        </form>
        <div className="mt-3 text-center">
          <Link to="/login" className="d-block mt-2">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};
