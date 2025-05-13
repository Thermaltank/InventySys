import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const UsuarioHeader = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      const usuarioId = localStorage.getItem("usuarioId");
      if (!usuarioId) return;

      try {
        const res = await axios.get(`http://localhost:8080/api/usuarios/${usuarioId}`);
        setNombreUsuario(res.data.nombre);
      } catch (e) {
        console.error("Error al obtener el usuario");
      }
    };

    fetchUsuario();
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuarioId");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ position: "fixed", top: 10, right: 20, zIndex: 1000 }}>
      <Dropdown align="end">
        <Dropdown.Toggle
          variant="light"
          id="dropdown-usuario"
          className="d-flex align-items-center"
        >
          <FaUserCircle size={22} className="me-2" />
          <span>{nombreUsuario}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => alert("Perfil próximamente")}>Perfil</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={logout}>Cerrar sesión</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
