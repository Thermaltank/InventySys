/* eslint-disable react/prop-types */
import {
  Offcanvas,
  Button,
  Alert,
  Table,
  Form,
  Modal,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";

export const Carrito = ({ show, onHide }) => {
  const [carrito, setCarrito] = useState([]);
  const [impuestos, setImpuestos] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [showModalDatos, setShowModalDatos] = useState(false);
  const [cedula, setCedula] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("contraentrega");

  const usuarioId = localStorage.getItem("usuarioId");
  const API_COMPRAS = "http://localhost:8080/api/compras";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";

  useEffect(() => {
    const stored = localStorage.getItem("carrito");
    if (stored) {
      setCarrito(JSON.parse(stored));
    }

    const savedImpuestos = localStorage.getItem("impuestos");
    if (savedImpuestos) {
      setImpuestos(JSON.parse(savedImpuestos));
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

      for (let i = 0; i < nuevoCarrito.length; i++) {
        const item = nuevoCarrito[i];
        const res = await axios.get(`${API_PRODUCTOS}/${item.producto.id}`);
        const productoActual = res.data;

        if (item.cantidad > productoActual.stock) {
          setError(`No hay suficiente stock para "${productoActual.nombre}".`);
          return;
        }

        nuevoCarrito[i].producto.stock = productoActual.stock;
      }

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

        await axios.put(`${API_PRODUCTOS}/${item.producto.id}`, {
          ...item.producto,
          stock: nuevoStock,
        });

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

  const totalCarrito = carrito.reduce((acc, item) => {
    const impuesto = impuestos[item.producto.id] || 0;
    const precioConIva = item.producto.precio * (1 + impuesto / 100);
    return acc + item.cantidad * precioConIva;
  }, 0);

  const handleAbrirModalDatos = () => {
    if (carrito.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    setShowModalDatos(true);
  };

  const handleConfirmarConDatos = () => {
    if (!cedula || !direccion || !metodoPago) {
      alert("Por favor completa todos los campos.");
      return;
    }

    localStorage.setItem(
      "datosCompra",
      JSON.stringify({ cedula, direccion, metodoPago })
    );

    setShowModalDatos(false);
    confirmarCompra();
  };

  return (
    <>
      <Offcanvas
        show={show}
        onHide={onHide}
        placement="end"
        style={{ width: "500px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>🛒 Carrito de Compras</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body
          style={{ overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}
        >
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
                  {carrito.map((item, index) => {
                    const impuesto = impuestos[item.producto.id] || 0;
                    const precioUnitarioConIVA =
                      item.producto.precio * (1 + impuesto / 100);
                    const totalPorProducto = item.cantidad * precioUnitarioConIVA;

                    return (
                      <tr key={index}>
                        <td>{item.producto.nombre}</td>
                        <td>${formatPrice(precioUnitarioConIVA)}</td>
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
                          {item.cantidad > item.producto.stock && (
                            <div style={{ color: "red", fontSize: "0.8rem" }}>
                              Stock insuficiente
                            </div>
                          )}
                        </td>
                        <td>${formatPrice(totalPorProducto)}</td>
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
                    );
                  })}
                </tbody>
              </Table>

              <h6 className="text-end">
                Subtotal: ${formatPrice(totalCarrito / 1.19)}
              </h6>
              <h6 className="text-end">
                IVA: ${formatPrice(totalCarrito - totalCarrito / 1.19)}
              </h6>
              <h5 className="text-end mb-3">
                Total: <strong>${formatPrice(totalCarrito)}</strong>
              </h5>

              <Button
                variant="success"
                onClick={handleAbrirModalDatos}
                className="w-100"
              >
                Confirmar Compra Total
              </Button>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal para completar datos antes de comprar */}
      <Modal
        show={showModalDatos}
        onHide={() => setShowModalDatos(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Completa tus datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cédula</Form.Label>
              <Form.Control
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Método de pago</Form.Label>
              <Form.Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="contraentrega">Pago contraentrega</option>
                <option value="transferencia">Pago por transferencia</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleConfirmarConDatos}>
            Confirmar Compra
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
