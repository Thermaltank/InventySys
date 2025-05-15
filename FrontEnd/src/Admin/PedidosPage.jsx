import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Table, Alert, Button } from "react-bootstrap";

export const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [statusVisual, setStatusVisual] = useState({});

  const API_PEDIDOS = "http://localhost:8080/api/compras";
  const API_USUARIO = "http://localhost:8080/api/usuarios";
  const API_PRODUCTO = "http://localhost:8080/api/productos";

  // Cargar estado visual desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("pedidoStatusVisual");
    if (stored) {
      setStatusVisual(JSON.parse(stored));
    }
  }, []);

  // Cargar pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await axios.get(API_PEDIDOS);
        const pedidosConDetalles = await Promise.all(
          res.data.map(async (pedido) => {
            try {
              const [usuarioRes, productoRes] = await Promise.all([
                axios.get(`${API_USUARIO}/${pedido.usuario}`),
                axios.get(`${API_PRODUCTO}/${pedido.producto}`)
              ]);
              return {
                ...pedido,
                usuario: usuarioRes.data,
                producto: productoRes.data,
              };
            } catch (err) {
              console.warn("Error en usuario o producto:", err);
              return pedido;
            }
          })
        );
        setPedidos(pedidosConDetalles);
      } catch (e) {
        setError("Error al cargar los pedidos.");
        console.error(e);
      }
    };
    fetchPedidos();
  }, []);

  // Guardar estado visual en localStorage
  const actualizarEstadoVisual = (id, estado) => {
    const nuevos = { ...statusVisual, [id]: estado };
    setStatusVisual(nuevos);
    localStorage.setItem("pedidoStatusVisual", JSON.stringify(nuevos));
  };

  const limpiarEstados = () => {
    setStatusVisual({});
    localStorage.removeItem("pedidoStatusVisual");
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

      {pedidos.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className={getRowClass(pedido.id)}>
                <td>{pedido.usuario?.nombre || "Usuario no disponible"}</td>
                <td>{pedido.producto?.nombre || "Producto no disponible"}</td>
                <td>{pedido.cantidad}</td>
                <td>
                  {pedido.producto?.precio
                    ? `$${formatPrice(pedido.cantidad * pedido.producto.precio)}`
                    : "N/A"}
                </td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => actualizarEstadoVisual(pedido.id, "cancelar")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => actualizarEstadoVisual(pedido.id, "procesar")}
                    >
                      Procesar
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => actualizarEstadoVisual(pedido.id, "vender")}
                    >
                      Vender
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};
