/* eslint-disable react/prop-types */
import { Offcanvas, Button, Alert, Table, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";

export const Carrito = ({ show, onHide }) => {
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const usuarioId = localStorage.getItem("usuarioId");
  const API_COMPRAS = "http://localhost:8080/api/compras";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";

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

  const notificarCompra = () => {
  const evento = new CustomEvent("compraRealizada");
  window.dispatchEvent(evento);
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
      const nuevoCarrito = [...carrito];

      // Verificamos el stock de cada producto
      for (let i = 0; i < nuevoCarrito.length; i++) {
        const item = nuevoCarrito[i];
        const res = await axios.get(`${API_PRODUCTOS}/${item.producto.id}`);
        const productoActual = res.data;

        if (item.cantidad > productoActual.stock) {
          setError(`No hay suficiente stock para "${productoActual.nombre}".`);
          return;
        }

        // Guardamos el stock actualizado para el siguiente paso
        nuevoCarrito[i].producto.stock = productoActual.stock;
      }

      // Realizamos compras y actualizamos stock
      for (const item of nuevoCarrito) {
        const fechaCompra = new Date().toISOString();

        const compraDTO = {
          usuario: parseInt(usuarioId),
          producto: item.producto.id,
          cantidad: item.cantidad,
          fechaCompra,
        };

        await axios.post(API_COMPRAS, compraDTO);

        const nuevoStock = item.producto.stock - item.cantidad;

        // Actualizamos el stock en el backend
        await axios.put(`${API_PRODUCTOS}/${item.producto.id}`, {
          ...item.producto,
          stock: nuevoStock,
        });

        // Actualizamos el stock en el item del carrito (por si lo seguimos mostrando)
        item.producto.stock = nuevoStock;
      }

      setMensaje("Compras confirmadas correctamente.");
      notificarCompra();
      setError(null);
      actualizarLocalStorage([]); // Limpiar carrito
    } catch (err) {
      console.error("Error al confirmar la compra:", err);
      setError("Error al confirmar la compra.");
    }
  };

  const formatPrice = (precio) => {
    const precioRedondeado = Math.round(precio);
    return new Intl.NumberFormat("es-CO").format(precioRedondeado);
  };

  const totalCarrito = carrito.reduce(
    (acc, item) => acc + item.cantidad * item.producto.precio,
    0
  );

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: "500px" }}>
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
                        onChange={(e) => cambiarCantidad(index, e.target.value)}
                      />
                      {item.cantidad > item.producto.stock && (
                        <div style={{ color: "red", fontSize: "0.8rem" }}>
                          Stock insuficiente
                        </div>
                      )}
                    </td>
                    <td>${formatPrice(item.cantidad * item.producto.precio)}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => eliminarItem(index)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <h5 className="text-end mb-3">
              Total: <strong>${formatPrice(totalCarrito)}</strong>
            </h5>

            <Button variant="success" onClick={confirmarCompra} className="w-100">
              Confirmar Compra Total
            </Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};
