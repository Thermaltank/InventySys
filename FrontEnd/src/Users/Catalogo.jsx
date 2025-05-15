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
  const [errorCantidad, setErrorCantidad] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const API_COMPRAS = "http://localhost:8080/api/compras";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";

  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(API_PRODUCTOS);
        setProductos(res.data);
      } catch (e) {
        console.error("Error al cargar productos:", e);
        setError("Error al cargar productos");
      }
    };

    fetchProductos();

    const listener = () => {
      fetchProductos();
    };

    window.addEventListener("compraRealizada", listener);

    return () => {
      window.removeEventListener("compraRealizada", listener);
    };
  }, []);

  const handleCardClick = (producto) => {
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

      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoSeleccionado.id ? { ...p, stock: nuevoStock } : p
        )
      );

      setMensaje(
        "Compra realizada con éxito, puedes descargar tu factura en mis pedidos"
      );
      setError(null);
    } catch (err) {
      console.error("Error al realizar la compra:", err);
      setError("Error al realizar la compra");
    } finally {
      setShowModal(false);
      setErrorCantidad(null);
    }
  };

  const handleAgregarCarrito = () => {
    if (cantidad > productoSeleccionado.stock) {
      setErrorCantidad("No hay suficiente stock para la cantidad solicitada");
      return;
    }

    const stored = localStorage.getItem("carrito");
    const carrito = stored ? JSON.parse(stored) : [];

    carrito.push({
      producto: productoSeleccionado,
      cantidad: parseInt(cantidad),
    });

    localStorage.setItem("carrito", JSON.stringify(carrito));
    setMensaje("Producto añadido al carrito");
    setShowModal(false);
    setErrorCantidad(null);
  };

  const formatPrice = (precio) => {
    const precioRedondeado = Math.round(precio);
    return new Intl.NumberFormat("es-CO").format(precioRedondeado);
  };

  const getStockMessage = (stock) => {
    if (stock === 0) {
      return <Alert variant="danger">Producto no disponible</Alert>;
    } else if (stock <= 10) {
      return <Alert variant="warning">¡Pocas unidades disponibles!</Alert>;
    } else {
      return <Alert variant="success">Muchas unidades disponibles</Alert>;
    }
  };

  const categoriasUnicas = [...new Set(productos.map((p) => p.categoria))];

  const productosFiltrados = productos.filter((producto) => {
    const nombreCoincide = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const categoriaCoincide = categoriaFiltro ? producto.categoria === categoriaFiltro : true;
    const precioCoincide = precioMax ? parseFloat(producto.precio) <= parseFloat(precioMax) : true;
    return nombreCoincide && categoriaCoincide && precioCoincide;
  });

  return (
    <Container className="mt-4">
      <h3>Catálogo de Productos</h3>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form className="mb-3">
        <Row>
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categoriasUnicas.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Control
              type="number"
              placeholder="Precio máximo"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
            />
          </Col>
        </Row>
      </Form>

      <Row>
        {productosFiltrados.map((producto) => (
          <Col md={4} lg={3} key={producto.id} className="mb-4">
            <Card
              onClick={() => handleCardClick(producto)}
              className="h-100 shadow-sm"
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <Card.Title>{producto.nombre}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted fw-semibold">
                  Categoría: {producto.categoria}
                </Card.Subtitle>
                <Card.Text>Precio: ${formatPrice(producto.precio)}</Card.Text>
                {getStockMessage(producto.stock)}
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
            onChange={handleCantidadChange}
          />
          {errorCantidad && (
            <Alert variant="danger" className="mt-2">
              {errorCantidad}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCompra} disabled={!!errorCantidad}>
            Comprar ya
          </Button>
          <Button variant="primary" onClick={handleAgregarCarrito} disabled={!!errorCantidad}>
            Añadir al carrito
          </Button>
        </Modal.Footer>
      </Modal>

      <BotonCarrito />
    </Container>
  );
};
