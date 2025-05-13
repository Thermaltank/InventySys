import { useState, useEffect } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import axios from 'axios';

export const ProductosPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nombre: '', categoria: '', precio: '', stock: '' });
  const [editId, setEditId] = useState(null); 
  const [showModal, setShowModal] = useState(false);

  const API_URL = 'http://localhost:8080/api/productos';

  // 🚀 Cargar productos del backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  //  Agregar o actualizar producto
  const handleAddOrUpdate = async () => {
    try {
      if (editId !== null) {
        await axios.put(`${API_URL}/${editId}`, {
          ...form,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock, 10),
        });
      } else {
        await axios.post(API_URL, {
          ...form,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock, 10),
        });
      }
      setForm({ nombre: '', categoria: '', precio: '', stock: '' });
      setEditId(null);
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  //  Editar producto
  const handleEdit = (product) => {
    setForm({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: product.precio,
      stock: product.stock,
    });
    setEditId(product.id);
    setShowModal(true);
  };

  //  Eliminar producto
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const getEstado = (stock) => {
    if (stock === 0) return <Badge bg="danger">Sin stock</Badge>;
    if (stock <= 3) return <Badge bg="warning" text="dark">Bajo</Badge>;
    return <Badge bg="success">Normal</Badge>;
  };

  const filtered = products.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

   const formatPrice = (precio) => {
  const precioRedondeado = Math.round(precio); // Redondea el precio a un número entero.
  
  return new Intl.NumberFormat('es-CO').format(precioRedondeado);
};


  return (
    <div className="p-4">
      <h3>Gestión de Productos</h3>

      <Form.Control
        type="text"
        placeholder="Buscar productos..."
        className="my-3"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <Button onClick={() => { setForm({ nombre: '', categoria: '', precio: '', stock: '' }); setEditId(null); setShowModal(true); }} variant="primary" className="mb-3">
        Agregar Producto
      </Button>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((product, index) => (
            <tr key={product.id}>
              <td>{index + 1}</td> {/* Reajustamos el ID localmente */}
              <td>{product.nombre}</td>
              <td>{product.categoria}</td>
              <td>${formatPrice(product.precio)}</td> {/* Formateamos el precio */}
              <td>{product.stock}</td>
              <td>{getEstado(product.stock)}</td>
              <td>
                <Button size="sm" variant="primary" onClick={() => handleEdit(product)} className="me-2">Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editId !== null ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
            />
            <br />
            <Form.Control
              name="categoria"
              placeholder="Categoría"
              value={form.categoria}
              onChange={handleChange}
            />
            <br />
            <Form.Control
              name="precio"
              placeholder="Precio"
              type="number"
              value={form.precio}
              onChange={handleChange}
            />
            <br />
            <Form.Control
              name="stock"
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAddOrUpdate}>
            {editId !== null ? 'Actualizar' : 'Agregar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
