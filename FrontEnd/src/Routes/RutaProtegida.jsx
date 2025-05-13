import { Navigate } from 'react-router-dom';

export const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem("usuarioId");

  return token && userId ? children : <Navigate to="/login" replace />;
};
