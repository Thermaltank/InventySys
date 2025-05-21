import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Alert, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { BotonCarrito } from "../components/BotonCarrito";

export const Favoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [impuestos, setImpuestos] = useState({});
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [errorCantidad, setErrorCantidad] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const API_COMPRAS = "http://localhost:8080/api/compras";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";
  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    // Carga favoritos
    const storedFavs = localStorage.getItem("favoritos");
    if (storedFavs) {
      setFavoritos(JSON.parse(storedFavs));
    }

    // Carga impuestos
    const savedImpuestos = localStorage.getItem("impuestos");
    if (savedImpuestos) {
      setImpuestos(JSON.parse(savedImpuestos));
    }
  }, []);

  const formatPrice = (precio) => {
    const precioRedondeado = Math.round(precio);
    return new Intl.NumberFormat("es-CO").format(precioRedondeado);
  };

  const handleEliminarFavorito = (id) => {
    const nuevosFavoritos = favoritos.filter((p) => p.id !== id);
    setFavoritos(nuevosFavoritos);
    localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
    setMensaje("Producto eliminado de favoritos");
  };

  const handleAbrirModalCompra = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
    setErrorCantidad(null);
    setShowModal(true);
  };

  const handleCantidadChange = (e) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) {
      setCantidad(1);
      setErrorCantidad(null);
      return;
    }
    if (val > productoSeleccionado.stock) {
      setErrorCantidad("No hay suficiente stock para la cantidad solicitada");
    } else {
      setErrorCantidad(null);
    }
    setCantidad(val);
  };

  const handleCompra = async () => {
    if (!usuarioId || !productoSeleccionado) return;

    if (cantidad > productoSeleccionado.stock) {
      setErrorCantidad("No hay suficiente stock para la cantidad solicitada");
      return;
    }

    try {
      const fechaActualISO = new Date().toISOString();

      const compraDTO = {
        usuario: parseInt(usuarioId),
        producto: productoSeleccionado.id,
        cantidad: parseInt(cantidad),
        fechaCompra: fechaActualISO,
      };

      await axios.post(API_COMPRAS, compraDTO);

      const nuevoStock = productoSeleccionado.stock - cantidad;
      await axios.put(`${API_PRODUCTOS}/${productoSeleccionado.id}`, {
        ...productoSeleccionado,
        stock: nuevoStock,
      });

      setFavoritos((prev) =>
        prev.map((p) =>
          p.id === productoSeleccionado.id ? { ...p, stock: nuevoStock } : p
        )
      );

      setMensaje("Compra realizada con éxito");
      setError(null);
      setShowModal(false);
    } catch (err) {
      console.error("Error al realizar la compra:", err);
      setError("Error al realizar la compra");
    }
  };

  const handleAgregarCarrito = () => {
    if (cantidad > productoSeleccionado.stock) {
      setErrorCantidad("No hay suficiente stock para la cantidad solicitada");
      return;
    }

    const stored = localStorage.getItem("carrito");
    const carrito = stored ? JSON.parse(stored) : [];

    const index = carrito.findIndex(
      (item) => item.producto.id === productoSeleccionado.id
    );

    if (index !== -1) {
      carrito[index].cantidad += cantidad;
      if (carrito[index].cantidad > productoSeleccionado.stock) {
        carrito[index].cantidad = productoSeleccionado.stock;
      }
    } else {
      carrito.push({
        producto: productoSeleccionado,
        cantidad: cantidad,
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    setMensaje("Producto añadido al carrito");
    setShowModal(false);
    setErrorCantidad(null);
  };

  return (
    <Container className="mt-4">
      <h3>Productos Favoritos</h3>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {favoritos.length === 0 ? (
        <Alert variant="info">No tienes productos favoritos aún.</Alert>
      ) : (
        <Row>
          {favoritos.map((producto) => {
            const impuesto = impuestos[producto.id] || 0;
            const precioBase = parseFloat(producto.precio);
            const precioFinal = precioBase + (precioBase * impuesto) / 100;

            return (
              <Col md={4} lg={3} key={producto.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{producto.nombre}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted fw-semibold">
                      Categoría: {producto.categoria}
                    </Card.Subtitle>
                    <Card.Text>
                      <strong>Precio ${formatPrice(precioFinal)}</strong>
                    </Card.Text>
                    
                    <Button
                      variant="danger"
                      className="me-2"
                      onClick={() => handleEliminarFavorito(producto.id)}
                    >
                      Eliminar
                    </Button>
                    <Button
                      variant="success"
                      
                      onClick={() => handleAbrirModalCompra(producto)}
                      disabled={producto.stock === 0}
                    >
                      Comprar
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{productoSeleccionado?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Selecciona la cantidad:</p>
          <Form.Control
            type="number"
            min={1}
            max={productoSeleccionado?.stock || 1}
            value={cantidad}
            onChange={handleCantidadChange}
          />
          {errorCantidad && (
            <Alert variant="danger" className="mt-2">
              {errorCantidad}
            </Alert>
          )}
          <p className="mt-3">
            Stock disponible: <strong>{productoSeleccionado?.stock}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={handleCompra}
            disabled={!!errorCantidad || !cantidad}
          >
            Comprar ya
          </Button>
          <Button
            variant="primary"
            onClick={handleAgregarCarrito}
            disabled={!!errorCantidad || !cantidad}
          >
            Añadir al carrito
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      <BotonCarrito />
    </Container>
  );
};
