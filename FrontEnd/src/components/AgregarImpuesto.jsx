/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export const AgregarImpuesto = ({ show, onClose, productos, onGuardar }) => {
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [impuesto, setImpuesto] = useState('');

  useEffect(() => {
    if (!show) {
      setProductoSeleccionado('');
      setImpuesto('');
    }
  }, [show]);

  const handleGuardar = () => {
    if (!productoSeleccionado || isNaN(impuesto)) return;

    onGuardar(productoSeleccionado, parseFloat(impuesto));
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Asignar Impuesto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Producto</Form.Label>
          <Form.Select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">-- Selecciona producto --</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Porcentaje de Impuesto (%)</Form.Label>
          <Form.Control
            type="number"
            
            value={impuesto}
            onChange={(e) => setImpuesto(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardar}>
          Guardar Impuesto
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

