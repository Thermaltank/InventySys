/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Table, Alert, Button, Modal } from "react-bootstrap";
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
  const [statusVisual, setStatusVisual] = useState({});
  const [motivosCancelados, setMotivosCancelados] = useState(() => {
    const stored = localStorage.getItem("motivosCancelados");
    return stored ? JSON.parse(stored) : {};
  });

  const API_COMPRAS = "http://localhost:8080/api/compras";
  const API_PRODUCTOS = "http://localhost:8080/api/productos";
  const usuarioId = localStorage.getItem("usuarioId");
  const usuarioNombre = localStorage.getItem("usuarioNombre") || "Cliente";

  const datosCompra = JSON.parse(localStorage.getItem("datosCompra") || "{}");
  const cedula = datosCompra.cedula || "No registrada";
  const direccion = datosCompra.direccion || "No registrada";
  const metodoPago = datosCompra.metodoPago || "No especificado";

  const impuestos = JSON.parse(localStorage.getItem("impuestos") || "{}");

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

        const agrupados = pedidosConDetalles.reduce((acc, pedido) => {
          const fecha = new Date(pedido.fechaCompra);
          const clave = fecha.toISOString().slice(0, 19);
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

    // Cargar estados visuales y motivos cancelados
    const storedStatus = localStorage.getItem("pedidoStatusVisual");
    if (storedStatus) {
      setStatusVisual(JSON.parse(storedStatus));
    }
    const storedMotivos = localStorage.getItem("motivosCancelados");
    if (storedMotivos) {
      setMotivosCancelados(JSON.parse(storedMotivos));
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

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case "vender":
        return "Pedido en camino";
      case "procesar":
        return "Procesando pedido";
      case "cancelar":
        return "Cancelado";
      default:
        return null;
    }
  };

  const FacturaPDF = ({ grupo }) => {
    const styles = StyleSheet.create({
      page: { padding: 30, fontSize: 16, textAlign: "center" },
      title: { fontSize: 24, marginBottom: 20, textAlign: "center", fontWeight: "bold" },
      row: { marginBottom: 10, textAlign: "center" },
    });

    const total = grupo.productos.reduce((acc, prod) => {
      const impuestoProd = impuestos[prod.producto?.id] || 0;
      const precioConImpuesto = prod.producto?.precio * (1 + impuestoProd / 100);
      return acc + prod.cantidad * precioConImpuesto;
    }, 0);

    return (
      <Document>
        <Page style={styles.page}>
          <Text style={styles.title}>Factura de Compra</Text>
          <Text style={styles.row}>Cliente: {usuarioNombre}</Text>
          <Text style={styles.row}>Cédula: {cedula}</Text>
          <Text style={styles.row}>Dirección: {direccion}</Text>
          <Text style={styles.row}>Método de pago: {metodoPago}</Text>
          <Text style={styles.row}>Fecha: {new Date(grupo.fecha).toLocaleString()}</Text>
          {grupo.productos.map((p, i) => {
            const impuestoProd = impuestos[p.producto?.id] || 0;
            const precioConImpuesto = p.producto?.precio * (1 + impuestoProd / 100);
            return (
              <Text key={i} style={styles.row}>
                {p.producto?.nombre} - Cant: {p.cantidad} - Precio: ${formatPrice(precioConImpuesto)}
              </Text>
            );
          })}
          <Text style={styles.row}>Total: ${formatPrice(total)}</Text>
        </Page>
      </Document>
    );
  };

  return (
    <Container className="mt-4">
      <h3>Mis Pedidos</h3>

      {/* Mostrar mensaje de cancelación o error */}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {pedidos.length === 0 && !error ? (
        <p>No has realizado ningún pedido.</p>
      ) : (
        <Table striped bordered hover>
          <thead></thead>
          <tbody>
            {pedidos.map((grupo, index) => {
              const totalGrupo = grupo.productos.reduce((acc, p) => {
                const impuestoProd = impuestos[p.producto?.id] || 0;
                const precioConImpuesto = p.producto?.precio * (1 + impuestoProd / 100);
                return acc + p.cantidad * precioConImpuesto;
              }, 0);

              const estadosGrupo = grupo.productos.map(p => statusVisual[p.id] || "");
              const estadoUnico = estadosGrupo.every(e => e === estadosGrupo[0]) ? estadosGrupo[0] : "";
              const textoEstado = obtenerTextoEstado(estadoUnico);

              return (
                <tr key={index}>
                  <td colSpan={4}>
                    {textoEstado && (
                      <Alert
                        variant={
                          estadoUnico === "vender"
                            ? "success"
                            : estadoUnico === "procesar"
                            ? "warning"
                            : "danger"
                        }
                        className="mt-2 mb-2"
                      >
                        Estado del pedido: <strong>{textoEstado}</strong>
                        {/* Mostrar motivo de cancelación si existe */}
                        {estadoUnico === "cancelar" && (
                          <div className="text-muted small mt-1">
                            Motivo: {motivosCancelados[grupo.productos[0].id] || "No especificado"}
                          </div>
                        )}
                      </Alert>
                    )}

                    <Table size="sm" className="mt-2">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio (con impuesto)</th>
                          <th>Total (con impuesto)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.productos.map((prod) => {
                          const impuestoProd = impuestos[prod.producto?.id] || 0;
                          const precioConImpuesto = prod.producto?.precio * (1 + impuestoProd / 100);
                          return (
                            <tr key={prod.id}>
                              <td>{prod.producto?.nombre}</td>
                              <td>{prod.cantidad}</td>
                              <td>${formatPrice(precioConImpuesto)}</td>
                              <td>${formatPrice(precioConImpuesto * prod.cantidad)}</td>
                            </tr>
                          );
                        })}
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

                    {(estadoUnico !== "cancelar" && estadoUnico !== "vender") && (
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (
                            window.confirm("¿Estás seguro que deseas cancelar este pedido?")
                          ) {
                            cancelarPedido(grupo.productos.map((prod) => prod.id));
                          }
                        }}
                      >
                        Cancelar Pedido
                      </Button>
                    )}
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
              <p><strong>Cédula:</strong> {cedula}</p>
              <p><strong>Dirección:</strong> {direccion}</p>
              <p><strong>Método de pago:</strong> {metodoPago}</p>
              <p><strong>Fecha:</strong> {new Date(pedidoSeleccionado.fecha).toLocaleString()}</p>
              {pedidoSeleccionado.productos.map((prod) => {
                const impuestoProd = impuestos[prod.producto?.id] || 0;
                const precioConImpuesto = prod.producto?.precio * (1 + impuestoProd / 100);
                return (
                  <div key={prod.id}>
                    <p><strong>Producto:</strong> {prod.producto?.nombre}</p>
                    <p><strong>Cantidad:</strong> {prod.cantidad}</p>
                    <p><strong>Precio unitario:</strong> ${formatPrice(precioConImpuesto)}</p>
                    <hr />
                  </div>
                );
              })}
            </>
          ) : (
            <p>No hay detalles disponibles.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {pedidoSeleccionado && (
            <PDFDownloadLink
              document={<FacturaPDF grupo={pedidoSeleccionado} />}
              fileName={`Factura-${pedidoSeleccionado.clave}.pdf`}
            >
              {({ loading }) =>
                  <Button variant="success" className="" disabled={loading}>
                    {loading ? "Generando PDF..." : "Descargar PDF"}
                  </Button>              }
            </PDFDownloadLink>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setPedidoSeleccionado(null);
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
