import axios from "axios";
import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Alert,
  Button,
  Modal,
  Form
} from "react-bootstrap";

export const PedidosPage = () => {
  const [pedidosAgrupados, setPedidosAgrupados] = useState([]);
  const [mensaje] = useState(null);
  const [error, setError] = useState(null);
  const [statusVisual, setStatusVisual] = useState({});
  const [impuestos, setImpuestos] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [grupoParaCancelar, setGrupoParaCancelar] = useState(null);
  const [motivosCancelados, setMotivosCancelados] = useState(() => {
    const stored = localStorage.getItem("motivosCancelados");
    return stored ? JSON.parse(stored) : {};
  });

  const API_PEDIDOS = "http://localhost:8080/api/compras";
  const API_USUARIO = "http://localhost:8080/api/usuarios";
  const API_PRODUCTO = "http://localhost:8080/api/productos";

  useEffect(() => {
    const stored = localStorage.getItem("pedidoStatusVisual");
    if (stored) {
      setStatusVisual(JSON.parse(stored));
    }

    const impuestosStorage = localStorage.getItem("impuestos");
    if (impuestosStorage) {
      try {
        setImpuestos(JSON.parse(impuestosStorage));
      } catch {
        console.warn("Error al parsear los impuestos del localStorage.");
      }
    }
  }, []);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await axios.get(API_PEDIDOS);
        const pedidosConDetalles = await Promise.all(
          res.data.map(async (pedido) => {
            try {
              const [usuarioRes, productoRes] = await Promise.all([
                axios.get(`${API_USUARIO}/${pedido.usuario}`),
                axios.get(`${API_PRODUCTO}/${pedido.producto}`),
              ]);
              return {
                ...pedido,
                usuario: usuarioRes.data,
                producto: productoRes.data,
                fechaCompra: pedido.fechaCompra || new Date().toISOString(),
              };
            } catch (err) {
              console.warn("Error en usuario o producto:", err);
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
              pedidos: [],
            };
            acc.push(grupo);
          }
          grupo.pedidos.push(pedido);
          return acc;
        }, []);

        agrupados.sort((a, b) => b.fecha - a.fecha);
        setPedidosAgrupados(agrupados);
      } catch (e) {
        setError("Error al cargar los pedidos.");
        console.error(e);
      }
    };

    fetchPedidos();
  }, []);

  const actualizarEstadoVisualGrupo = (grupo, estado) => {
    const nuevos = { ...statusVisual };
    grupo.pedidos.forEach((pedido) => {
      nuevos[pedido.id] = estado;
    });
    setStatusVisual(nuevos);
    localStorage.setItem("pedidoStatusVisual", JSON.stringify(nuevos));
  };

  const confirmarCancelacion = () => {
    if (!grupoParaCancelar) return;

    const nuevosMotivos = { ...motivosCancelados };
    grupoParaCancelar.pedidos.forEach((pedido) => {
      nuevosMotivos[pedido.id] = motivoCancelacion;
    });

    setMotivosCancelados(nuevosMotivos);
    localStorage.setItem("motivosCancelados", JSON.stringify(nuevosMotivos));

    actualizarEstadoVisualGrupo(grupoParaCancelar, "cancelar");

    setMostrarModal(false);
    setMotivoCancelacion("");
    setGrupoParaCancelar(null);
  };

  const limpiarEstados = () => {
    setStatusVisual({});
    localStorage.removeItem("pedidoStatusVisual");
    setMotivosCancelados({});
    localStorage.removeItem("motivosCancelados");
  };

  const getRowClass = (id) => {
    switch (statusVisual[id]) {
      case "cancelar":
        return "table-danger";
      case "procesar":
        return "table-warning";
      case "vender":
        return "table-success";
      default:
        return "";
    }
  };

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO").format(Math.round(precio));
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case "vender":
        return "Pedido en camino";
      case "procesar":
        return "Procesando Pedido";
      case "cancelar":
        return "Cancelado";
      default:
        return "Sin estado";
    }
  };

  const calcularPrecioConImpuesto = (productoId, precioBase) => {
    const impuesto = impuestos[productoId] || 0;
    return precioBase * (1 + impuesto / 100);
  };

  return (
    <Container className="mt-4">
      <h3>Pedidos de Usuarios</h3>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-3">
        <Button variant="secondary" onClick={limpiarEstados}>
          Limpiar Estados Visuales
        </Button>
      </div>

      {pedidosAgrupados.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        pedidosAgrupados.map((grupo) => {

          return (
            <div key={grupo.clave} className="mb-4">
              <h5>Fecha: {grupo.fecha.toLocaleString()}</h5>
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total (con impuesto)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.pedidos.map((pedido) => {
                    const productoId = pedido.producto?.id;
                    const precioBase = pedido.producto?.precio || 0;
                    const precioConImpuesto = calcularPrecioConImpuesto(productoId, precioBase);
                    const total = pedido.cantidad * precioConImpuesto;

                    return (
                      <tr key={pedido.id} className={getRowClass(pedido.id)}>
                        <td>{pedido.usuario?.nombre || "Usuario no disponible"}</td>
                        <td>{pedido.producto?.nombre || "Producto no disponible"}</td>
                        <td>{pedido.cantidad}</td>
                        <td>{`$${formatPrice(total)}`}</td>
                        <td>
                          {obtenerTextoEstado(statusVisual[pedido.id])}
                          {statusVisual[pedido.id] === "cancelar" && motivosCancelados[pedido.id] && (
                            <div className="text-muted small">Motivo: {motivosCancelados[pedido.id]}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    setGrupoParaCancelar(grupo);
                    setMostrarModal(true);
                  }}
                >
                  Cancelar Pedido
                </Button>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => actualizarEstadoVisualGrupo(grupo, "procesar")}
                >
                  Procesar Pedido
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => actualizarEstadoVisualGrupo(grupo, "vender")}
                >
                  Vender Pedido
                </Button>
              </div>
            </div>
          );
        })
      )}

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Motivo de Cancelación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Ingrese el motivo</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cerrar
          </Button>
          <Button
            variant="danger"
            onClick={confirmarCancelacion}
            disabled={!motivoCancelacion.trim()}
          >
            Confirmar Cancelación
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
