import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Table, Button, Alert, Modal, Form } from "react-bootstrap";

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const API_USUARIOS = "http://localhost:8080/api/usuarios";

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get(API_USUARIOS);
      setUsuarios(res.data);
    } catch {
      setError("Error al cargar los usuarios.");
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      await axios.delete(`${API_USUARIOS}/${id}`);
      setUsuarios(usuarios.filter(u => u.id !== id));
      setMensaje("Usuario eliminado correctamente.");
    } catch {
      setError("Error al eliminar el usuario.");
    }
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setShowModal(true);
  };

  const guardarCambios = async () => {
    try {
      await axios.put(`${API_USUARIOS}/${usuarioEditando.id}`, usuarioEditando);
      setShowModal(false);
      setMensaje("Usuario actualizado correctamente.");
      fetchUsuarios(); // Actualiza lista
    } catch {
      setError("Error al actualizar el usuario.");
    }
  };

  return (
    <Container className="mt-4">
      <h3>Usuarios Registrados</h3>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>
                <Button variant="warning" onClick={() => abrirModalEditar(usuario)}>
                  Editar
                </Button>{" "}
                <Button variant="danger" onClick={() => eliminarUsuario(usuario.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={usuarioEditando?.nombre || ""}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="correo" className="mt-2">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                value={usuarioEditando?.email || ""}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, email: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarCambios}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
