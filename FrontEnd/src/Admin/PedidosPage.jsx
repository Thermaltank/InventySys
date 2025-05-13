import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Table, Alert, Button } from "react-bootstrap";

export const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const API_PEDIDOS = "http://localhost:8080/api/compras"; // API para obtener los pedidos
  const API_USUARIO = "http://localhost:8080/api/usuarios"; // API para obtener el usuario
  const API_PRODUCTO = "http://localhost:8080/api/productos"; // API para obtener el producto

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await axios.get(API_PEDIDOS);

        // Aquí se mapea para agregar los detalles del usuario y del producto
        const pedidosConDetalles = await Promise.all(
          res.data.map(async (pedido) => {
            const usuarioId = pedido.usuario;
            const productoId = pedido.producto;

            // Asegurarnos de que los IDs sean válidos antes de realizar la solicitud
            if (usuarioId && productoId) {
              try {
                // Obtener usuario por ID
                const usuarioRes = await axios.get(`${API_USUARIO}/${usuarioId}`);
                // Obtener producto por ID
                const productoRes = await axios.get(`${API_PRODUCTO}/${productoId}`);

                return {
                  ...pedido,
                  usuario: usuarioRes.data, // Añadir detalles del usuario
                  producto: productoRes.data, // Añadir detalles del producto
                };
              } catch (error) {
                console.error("Error al obtener detalles del usuario o producto:", error);
                return pedido; // Si falla, devolvemos el pedido sin detalles
              }
            } else {
              return pedido; // Si no hay usuario o producto, devolvemos el pedido tal cual
            }
          })
        );

        setPedidos(pedidosConDetalles); // Actualizamos la lista de pedidos con los detalles
      } catch (e) {
        setError("Error al cargar los pedidos.");
        console.error(e);
      }
    };

    fetchPedidos();
  }, []);

  const despacharPedido =  () => {
    
  };

  // Función para redondear el precio
   const formatPrice = (precio) => {
  const precioRedondeado = Math.round(precio); // Redondea el precio a un número entero.
  
  return new Intl.NumberFormat('es-CO').format(precioRedondeado);
};


  return (
    <Container className="mt-4">
      <h3>Pedidos de Usuarios</h3>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {pedidos.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        <Table striped bordered hover>
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
              <tr key={pedido.id}>
                <td>
                  {pedido.usuario ? pedido.usuario.nombre : "Usuario no disponible"}
                </td>
                <td>
                  {pedido.producto ? pedido.producto.nombre : "Producto no disponible"}
                </td>
                <td>{pedido.cantidad}</td>
                <td>
                  {pedido.producto && pedido.producto.precio
                    ? `$${formatPrice(pedido.cantidad * pedido.producto.precio)}`
                    : "N/A"}
                </td>
                <td>
                  <div className="d-flex gap-3">
                    <Button
                    variant="danger"
                    onClick={() => despacharPedido(pedido.id)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => despacharPedido(pedido.id)}
                  >
                    Procesar
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => despacharPedido(pedido.id)}
                  >
                    Vender
                  </Button></div>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};
