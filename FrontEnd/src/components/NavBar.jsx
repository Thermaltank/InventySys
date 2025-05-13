import { Link, useLocation } from "react-router-dom";

export const NavBar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar d-flex flex-column vh-100 p-3"
      style={{ backgroundColor: "#2f3c58" }}>
      <h4 className="mb-0 text-white">InventySys</h4>
      <small className="mb-4 text-white-50">Panel de Administrador</small>

      <ul className="nav nav-pills flex-column">
        <li className="nav-item mb-2">
          <Link 
            to="/productos" 
            className={`nav-link ${isActive("/productos") ? "active" : "text-white"}`}>
            📦 Gestión de Productos
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link 
            to="/usuarios" 
            className={`nav-link ${isActive("/usuarios") ? "active" : "text-white"}`}>
            👥 Usuarios
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link 
            to="/pedidos" 
            className={`nav-link ${isActive("/pedidos") ? "active" : "text-white"}`}>
            🧾 Pedidos
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link 
            to="/categorias" 
            className={`nav-link ${isActive("/categorias") ? "active" : "text-white"}`}>
            🏛️ Categorias
          </Link>
        </li>
        

        <li className="nav-item mb-2">
          <Link 
            to="/configuracion" 
            className={`nav-link ${isActive("/configuracion") ? "active" : "text-white"}`}>
            ⚙️ Configuración
          </Link>
        </li><li className="nav-item mb-2">
          <Link 
            to="/Proveedores" 
            className={`nav-link ${isActive("/") ? "active" : "text-white"}`}>
            📦 Proveedores
          </Link>
        </li>

        <li className="nav-item mt-auto"
          style={{ position: "absolute", bottom: "20px" }}>
          <Link to="/" className="btn btn-danger w-100">
            🚪 Cerrar Sesión
          </Link>
        </li>
      </ul>
    </div>
  );
};
