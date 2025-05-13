import { Offcanvas, Button, Alert, Table, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";

export const Carrito = ({ show, onHide }) => {
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const usuarioId = localStorage.getItem("usuarioId");
  const API_COMPRAS = "http://localhost:8080/api/compras";

  useEffect(() => {
    const stored = localStorage.getItem("carrito");
    if (stored) {
      setCarrito(JSON.parse(stored));
    }
  }, [show]); 

  const actualizarLocalStorage = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const cambiarCantidad = (index, nuevaCantidad) => {
    const copia = [...carrito];
    copia[index].cantidad = parseInt(nuevaCantidad);
    actualizarLocalStorage(copia);
  };

  const eliminarItem = (index) => {
    const copia = carrito.filter((_, i) => i !== index);
    actualizarLocalStorage(copia);
  };

  const confirmarCompra = async () => {
    if (!usuarioId || carrito.length === 0) return;

    try {
      for (const item of carrito) {
        const compraDTO = {
          usuario: parseInt(usuarioId),
          producto: item.producto.id,
          cantidad: item.cantidad,
        };
        await axios.post(API_COMPRAS, compraDTO);
      }
      setMensaje("Compras confirmadas correctamente.");
      actualizarLocalStorage([]);
    } catch (err) {
      setError("Error al confirmar la compra.");
    }
  };
 const formatPrice = (precio) => {
  const precioRedondeado = Math.round(precio); // Redondea el precio a un número entero.
  
  return new Intl.NumberFormat('es-CO').format(precioRedondeado);
};



  return (
    <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '500px' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>🛒 Carrito de Compras</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}>
        {mensaje && <Alert variant="success">{mensaje}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {carrito.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item, index) => (
                  <tr key={index}>
                    <td>{item.producto.nombre}</td>
                    <td>${formatPrice(item.producto.precio)}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={item.cantidad}
                        min="1"
                        max={item.producto.stock}
                        onChange={(e) =>
                          cambiarCantidad(index, e.target.value)
                        }
                      />
                    </td>
                          <td>${formatPrice(item.cantidad * item.producto.precio)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarItem(index)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button variant="success" onClick={confirmarCompra} className="w-100">
              Confirmar Compra Total
            </Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};
