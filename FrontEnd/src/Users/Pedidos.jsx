/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Alert,
  Button,
  Modal,
} from "react-bootstrap";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  
  StyleSheet,
} from "@react-pdf/renderer";

// Logo embebido en base64 (ejemplo)

export const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const API_COMPRAS = "http://localhost:8080/api/compras";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";
  const usuarioId = localStorage.getItem("usuarioId");
  const usuarioNombre = localStorage.getItem("usuarioNombre") || "Cliente";

 const formatPrice = (precio) => {
  const precioRedondeado = Math.round(precio); // Redondea el precio a un número entero.
  
  return new Intl.NumberFormat('es-CO').format(precioRedondeado);
};

  useEffect(() => {
    const fetchPedidosUsuario = async () => {
      try {
        const res = await axios.get(API_COMPRAS);
        const pedidosUsuario = res.data.filter(p => p.usuario == usuarioId);

        const pedidosConDetalles = await Promise.all(
          pedidosUsuario.map(async (pedido) => {
            try {
              const productoRes = await axios.get(`${API_PRODUCTOS}/${pedido.producto}`);
              return {
                ...pedido,
                producto: productoRes.data,
              };
            } catch {
              return pedido;
            }
          })
        );

        setPedidos(pedidosConDetalles);
      } catch (err) {
        console.error("Error al cargar los pedidos:", err);
        setError("Error al cargar tus pedidos.");
      }
    };

    if (usuarioId) {
      fetchPedidosUsuario();
    } else {
      setError("Debes iniciar sesión para ver tus pedidos.");
    }
  }, [usuarioId]);

  const cancelarPedido = async (pedidoId) => {
    try {
      await axios.delete(`${API_COMPRAS}/${pedidoId}`);
      setPedidos(pedidos.filter((p) => p.id !== pedidoId));
      setMensaje("Pedido cancelado correctamente.");
    } catch (err) {
      console.error("Error al cancelar el pedido:", err);
      setError("Error al cancelar el pedido.");
    }
  };

  const abrirModal = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowModal(true);
  };

  const FacturaPDF = ({ pedido }) => {
    const styles = StyleSheet.create({
      page: { padding: 30, fontSize: 12 },
      title: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
      row: { marginBottom: 6 },
      logo: { width: 100, height: 40, marginBottom: 20, alignSelf: 'center' },
    });

    return (
      <Document>
        <Page style={styles.page}>
          <Text style={styles.title}>Factura de Compra</Text>
          <Text style={styles.row}>Cliente: {usuarioNombre}</Text>
          <Text style={styles.row}>Producto: {pedido.producto?.nombre}</Text>
          <Text style={styles.row}>Cantidad: {pedido.cantidad}</Text>
          <Text style={styles.row}>Precio unitario: ${formatPrice(pedido.producto?.precio)}</Text>
          <Text style={styles.row}>Total: ${formatPrice(pedido.cantidad * pedido.producto?.precio)}</Text>
          <Text style={styles.row}>Fecha: {new Date(pedido.fecha || Date.now()).toLocaleDateString()}</Text>
        </Page>
      </Document>
    );
  };

  

  return (
    <Container className="mt-4">
      <h3>Mis Pedidos</h3>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {pedidos.length === 0 && !error ? (
        <p>No has realizado ningún pedido.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.producto?.nombre || "No disponible"}</td>
                <td>{pedido.cantidad}</td>
                <td>
                  {pedido.producto?.precio
                    ? `$${formatPrice(pedido.cantidad * pedido.producto.precio)}`
                    : "N/A"}
                </td>
                <td>
                  <Button
                    variant="info"
                    className="me-2"
                    onClick={() => abrirModal(pedido)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => cancelarPedido(pedido.id)}
                  >
                    Cancelar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setPedidoSeleccionado(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pedidoSeleccionado && pedidoSeleccionado.producto ? (
            <>
              <p><strong>Producto:</strong> {pedidoSeleccionado.producto.nombre}</p>
              <p><strong>Cantidad:</strong> {pedidoSeleccionado.cantidad}</p>
              <p><strong>Precio unitario:</strong> ${formatPrice(pedidoSeleccionado.producto.precio)}</p>
              <p><strong>Total:</strong> ${formatPrice(pedidoSeleccionado.cantidad * pedidoSeleccionado.producto.precio)}</p>

              <PDFDownloadLink
                document={<FacturaPDF pedido={pedidoSeleccionado} />}
                fileName="factura_InventySys.pdf"
              >
                {({ loading }) => (
                  <Button variant="success" className="mt-3" disabled={loading}>
                    {loading ? "Generando PDF..." : "Descargar PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </>
          ) : (
            <p>Cargando detalles del pedido...</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};
