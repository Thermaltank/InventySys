import { useState, useEffect } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [categoriaName, setCategoriaName] = useState('');
  const [error, setError] = useState(null);

  // Cargar categorías desde localStorage al inicio
  useEffect(() => {
    const saved = localStorage.getItem('categorias');
    if (saved) setCategorias(JSON.parse(saved));
  }, []);

  // Guardar categorías en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('categorias', JSON.stringify(categorias));
  }, [categorias]);

  const openNewModal = () => {
    setCategoriaName('');
    setEditIndex(null);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (index) => {
    setCategoriaName(categorias[index]);
    setEditIndex(index);
    setError(null);
    setShowModal(true);
  };

  const handleSave = () => {
    const name = categoriaName.trim();
    if (!name) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    // Validar no duplicados (excepto si editas la misma categoría)
    if (
      categorias.some(
        (cat, idx) => cat.toLowerCase() === name.toLowerCase() && idx !== editIndex
      )
    ) {
      setError('Esta categoría ya existe');
      return;
    }

    let nuevasCategorias = [...categorias];

    if (editIndex !== null) {
      // Editar
      nuevasCategorias[editIndex] = name;
    } else {
      // Crear nueva
      nuevasCategorias.push(name);
    }

    setCategorias(nuevasCategorias);
    setShowModal(false);
  };

  const handleDelete = (index) => {
    if (window.confirm(`¿Seguro que quieres eliminar la categoría "${categorias[index]}"?`)) {
      const nuevasCategorias = categorias.filter((_, i) => i !== index);
      setCategorias(nuevasCategorias);
    }
  };

  return (
    <div className="p-4">
      <h3>Gestión de Categorías</h3>
      <Button onClick={openNewModal} variant="primary" className="mb-3">
        Nueva Categoría
      </Button>

      {categorias.length === 0 ? (
        <p>No hay categorías creadas aún.</p>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{cat}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => openEditModal(idx)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(idx)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            placeholder="Nombre de la categoría"
            value={categoriaName}
            onChange={(e) => setCategoriaName(e.target.value)}
            autoFocus
          />
          {error && <div className="text-danger mt-2">{error}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSave}>
            {editIndex !== null ? 'Actualizar' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
