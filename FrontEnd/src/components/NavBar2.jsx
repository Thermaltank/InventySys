import { Link, useLocation, useNavigate } from "react-router-dom";

export const NavBar2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuarioId");
    navigate("/login", { replace: true }); // 🔁 reemplaza la URL actual para que no quede en el historial
  };
  

  return (
    <div className="sidebar d-flex flex-column vh-100 p-3" style={{ backgroundColor: "#2f3c58" }}>
      <h4 className="mb-0 text-white">InventySys</h4>
      <small className="mb-4 text-white-50">Bienvenido a nuestra tienda</small>

      <ul className="nav nav-pills flex-column">
        <li className="nav-item mb-2">
          <Link to="/catalogo" className={`nav-link ${isActive("/catalogo") ? "active" : "text-white"}`}>
            📦 Catalogo de Productos
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link to="/pedidosCliente" className={`nav-link ${isActive("/pedidosCliente") ? "active" : "text-white"}`}>
            🛒 Mis pedidos
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link to="/favoritos" className={`nav-link ${isActive("/favoritos") ? "active" : "text-white"}`}>
            ❤️ Favoritos
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link to="/configuracion2" className={`nav-link ${isActive("/configuracion2") ? "active" : "text-white"}`}>
            ⚙️ Configuración
          </Link>
        </li>

        <li className="nav-item mt-auto" style={{ position: "absolute", bottom: "20px" }}>
          <button className="btn btn-danger" onClick={logout}>
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
};
