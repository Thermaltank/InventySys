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
    const precioRedondeado = Math.round(precio);
    return new Intl.NumberFormat("es-CO").format(precioRedondeado);
  };

  useEffect(() => {
    const fetchPedidosUsuario = async () => {
      try {
        const res = await axios.get(API_COMPRAS);
        const pedidosUsuario = res.data.filter((p) => p.usuario == usuarioId);

        const pedidosConDetalles = await Promise.all(
          pedidosUsuario.map(async (pedido) => {
            try {
              const productoRes = await axios.get(
                `${API_PRODUCTOS}/${pedido.producto}`
              );
              return {
                ...pedido,
                producto: productoRes.data,
                fechaCompra: pedido.fechaCompra || new Date().toISOString(),
              };
            } catch {
              return pedido;
            }
          })
        );

        // Agrupación de pedidos por fecha y hora exacta hasta segundos
        const agrupados = pedidosConDetalles.reduce((acc, pedido) => {
          // Extraemos la fecha hasta segundos: "YYYY-MM-DDTHH:mm:ss"
          const fecha = new Date(pedido.fechaCompra);
          const clave = fecha.toISOString().slice(0, 19); // Ejemplo: "2025-05-15T07:24:35"

          // Buscar si ya existe un grupo con esa clave
          let grupo = acc.find((g) => g.clave === clave);

          if (!grupo) {
            grupo = {
              clave,
              fecha,
              productos: [],
            };
            acc.push(grupo);
          }

          grupo.productos.push(pedido);
          return acc;
        }, []);

        setPedidos(agrupados);
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

  const cancelarPedido = async (pedidoIds) => {
    try {
      await Promise.all(
        pedidoIds.map((id) => axios.delete(`${API_COMPRAS}/${id}`))
      );
      setPedidos(
        pedidos.filter(
          (p) => !pedidoIds.some((id) => p.productos.find((pr) => pr.id === id))
        )
      );
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

  const FacturaPDF = ({ grupo }) => {
    const styles = StyleSheet.create({
      page: { padding: 30, fontSize: 12 },
      title: { fontSize: 16, marginBottom: 10, textAlign: "center" },
      row: { marginBottom: 6 },
    });

    const total = grupo.productos.reduce(
      (acc, prod) => acc + prod.cantidad * prod.producto?.precio,
      0
    );

    return (
      <Document>
        <Page style={styles.page}>
          <Text style={styles.title}>Factura de Compra</Text>
          <Text style={styles.row}>Cliente: {usuarioNombre}</Text>
          <Text style={styles.row}>
            Fecha: {new Date(grupo.fecha).toLocaleString()}
          </Text>
          {grupo.productos.map((p, i) => (
            <Text key={i} style={styles.row}>
              {p.producto?.nombre} - Cant: {p.cantidad} - Precio: ${formatPrice(
                p.producto?.precio
              )}
            </Text>
          ))}
          <Text style={styles.row}>Total: ${formatPrice(total)}</Text>
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
            {/* Puedes agregar encabezados aquí si quieres */}
          </thead>
          <tbody>
            {pedidos.map((grupo, index) => {
              const totalGrupo = grupo.productos.reduce(
                (acc, p) => acc + p.cantidad * p.producto?.precio,
                0
              );
              return (
                <tr key={index}>
                  <td colSpan={4}>
                    <strong>Pedido realizado el:</strong>{" "}
                    {new Date(grupo.clave).toLocaleString()}
                    <Table size="sm" className="mt-2">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.productos.map((prod) => (
                          <tr key={prod.id}>
                            <td>{prod.producto?.nombre}</td>
                            <td>{prod.cantidad}</td>
                            <td>${formatPrice(prod.producto?.precio)}</td>
                            <td>
                              ${formatPrice(prod.cantidad * prod.producto?.precio)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={3}><strong>Total de la compra</strong></td>
                          <td><strong>${formatPrice(totalGrupo)}</strong></td>
                        </tr>
                      </tbody>
                    </Table>
                    <Button
                      variant="info"
                      className="me-2"
                      onClick={() => abrirModal(grupo)}
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => cancelarPedido(grupo.productos.map((p) => p.id))}
                    >
                      Notificar un problema
                    </Button>
                  </td>
                </tr>
              );
            })}
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
          {pedidoSeleccionado ? (
            <>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(pedidoSeleccionado.fecha).toLocaleString()}
              </p>
              {pedidoSeleccionado.productos.map((prod) => (
                <div key={prod.id}>
                  <p>
                    <strong>Producto:</strong> {prod.producto?.nombre}
                  </p>
                  <p>
                    <strong>Cantidad:</strong> {prod.cantidad}
                  </p>
                  <p>
                    <strong>Precio:</strong> ${formatPrice(prod.producto?.precio)}
                  </p>
                  <hr />
                </div>
              ))}
              <PDFDownloadLink
                document={<FacturaPDF grupo={pedidoSeleccionado} />}
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
