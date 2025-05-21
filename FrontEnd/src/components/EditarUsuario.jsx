import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const EditarUsuario = () => {
  const usuarioId = localStorage.getItem("usuarioId");
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalDatos, setModalDatos] = useState(false);
  const [modalContrasena, setModalContrasena] = useState(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/usuarios/${usuarioId}`);
        setUsuario(res.data);
        setNombre(res.data.nombre);
        setEmail(res.data.email);
      } catch {
        setError("Error al obtener datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) fetchUsuario();
  }, [usuarioId]);

  const handleActualizarDatos = async () => {
    try {
      await axios.put(`http://localhost:8080/api/usuarios/${usuarioId}`, {
        ...usuario,
        nombre,
        email,
      });
      setUsuario((prev) => ({ ...prev, nombre, email }));
      localStorage.setItem("usuarioNombre", nombre);
      setMensaje("Datos actualizados correctamente");
      setModalDatos(false);
    } catch {
      setError("Error al actualizar los datos");
    }
  };

  const handleCambiarContrasena = async () => {
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (contrasenaActual !== usuario.contrasena) {
      setError("La contraseña actual no es correcta");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/usuarios/${usuarioId}`, {
        ...usuario,
        contrasena: nuevaContrasena,
      });
      setUsuario((prev) => ({ ...prev, contrasena: nuevaContrasena }));
      setMensaje("Contraseña actualizada correctamente");
      setModalContrasena(false);
    } catch {
      setError("Error al cambiar la contraseña");
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Spinner animation="border" />
        <p>Cargando datos...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
    <Card className="p-4 text-start me-auto" style={{ width: '30%' }}>
        <h4 className="mb-3">Perfil del Usuario</h4>
        {mensaje && <Alert variant="success">{mensaje}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <p><strong>Nombre:</strong> {usuario?.nombre}</p>
        <p><strong>Correo:</strong> {usuario?.email}</p>

        <div className="d-grid gap-2 mt-4">
          <Button variant="primary" onClick={() => setModalDatos(true)}>
            Cambiar datos del usuario
          </Button>
          <Button variant="warning" onClick={() => setModalContrasena(true)}>
            Cambiar contraseña
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Regresar
          </Button>
        </div>
      </Card>

      {/* Modal - Cambiar datos */}
      <Modal show={modalDatos} onHide={() => setModalDatos(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar datos del usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="text-start">
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalDatos(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleActualizarDatos}>
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal - Cambiar contraseña */}
      <Modal show={modalContrasena} onHide={() => setModalContrasena(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Cambiar contraseña</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form className="text-start" autoComplete="off">
      {/* Campos señuelo para engañar el navegador */}
      <input type="text" name="usuario" autoComplete="username" style={{ display: "none" }} />
      <input type="password" name="password" autoComplete="new-password" style={{ display: "none" }} />

      <Form.Group className="mb-2">
        <Form.Label>Contraseña actual</Form.Label>
        <Form.Control
        type="password"
          name="contrasena_actual_real"
          value={contrasenaActual}
          onChange={(e) => setContrasenaActual(e.target.value)}
          autoComplete="new-password"
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Nueva contraseña</Form.Label>
        <Form.Control
          type="password"
          name="nueva_contrasena_real"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
          autoComplete="new-password"
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Confirmar nueva contraseña</Form.Label>
        <Form.Control
          type="password"
          name="confirmar_contrasena_real"
          value={confirmarContrasena}
          onChange={(e) => setConfirmarContrasena(e.target.value)}
          autoComplete="new-password"
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setModalContrasena(false)}>
      Cancelar
    </Button>
    <Button variant="warning" onClick={handleCambiarContrasena}>
      Cambiar contraseña
    </Button>
  </Modal.Footer>
</Modal>

    </Container>
  );
};
