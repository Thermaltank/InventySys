import { Link } from "react-router-dom";

export const Recovery = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
          <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 className="text-center mb-4">Recuperar Contraseña</h3>
            <form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Ingresa tu correo"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Enviar instrucciones</button>
            </form>
            <div className="mt-3 text-center">
                <Link to="/login" className="d-block mt-2">¿Ya tienes cuenta? Inicia sesión</Link>
            </div>
          </div>
        </div>
      );
    }
