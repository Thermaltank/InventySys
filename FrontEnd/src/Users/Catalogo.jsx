import axios from "axios";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
  Alert,
  Form,
} from "react-bootstrap";
import { BotonCarrito } from "../components/BotonCarrito";

export const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const API_COMPRAS = "http://localhost:8080/api/compras";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";

  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(API_PRODUCTOS);
        setProductos(res.data);
      } catch (e) {
        setError("Error al cargar productos");
      }
    };
    fetchProductos();
  }, []);

  const handleCardClick = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad(1); // Reset cantidad al abrir
    setShowModal(true);
  };

  const handleCompra = async () => {
    if (!usuarioId || !productoSeleccionado) return;

    try {
      const compraDTO = {
        usuario: parseInt(usuarioId),
        producto: productoSeleccionado.id,
        cantidad: parseInt(cantidad), 
      };

      const res = await axios.post(API_COMPRAS, compraDTO);
      setMensaje("Compra realizada con éxito, puedes descargar tu factura en mis pedidos");
    } catch (err) {
      setError("Error al realizar la compra");
    } finally {
      setShowModal(false);
    }
  };

  const handleAgregarCarrito = () => {
    const stored = localStorage.getItem("carrito");
    const carrito = stored ? JSON.parse(stored) : [];
  
    carrito.push({
      producto: productoSeleccionado,
      cantidad: parseInt(cantidad),
    });
  
    localStorage.setItem("carrito", JSON.stringify(carrito));
    setMensaje("Producto añadido al carrito");
    setShowModal(false);
  };
  const formatPrice = (precio) => {
  const precioRedondeado = Math.round(precio); // Redondea el precio a un número entero.
  
  return new Intl.NumberFormat('es-CO').format(precioRedondeado);
};

  

  return (
    <Container className="mt-4">
      <h3>Catálogo de Productos</h3>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {productos.map((producto) => (
          <Col md={4} lg={3} key={producto.id} className="mb-4">
            <Card
              onClick={() => handleCardClick(producto)}
              className="h-100 shadow-sm"
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <Card.Title>{producto.nombre}</Card.Title>
                <Card.Text>Precio: ${formatPrice(producto.precio)}</Card.Text>
                <Card.Text>Stock: {producto.stock}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{productoSeleccionado?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Selecciona la cantidad:</p>
          <Form.Control
            type="number"
            min={1}
            max={productoSeleccionado?.stock || 10}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCompra}>
            Comprar ya
          </Button>
          <Button variant="primary" onClick={handleAgregarCarrito}>
            Añadir al carrito
          </Button>
        </Modal.Footer>
      </Modal>
      <BotonCarrito />

    </Container>
  );
};
