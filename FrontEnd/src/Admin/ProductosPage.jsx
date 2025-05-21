import { useState, useEffect } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import { AgregarImpuesto } from '../components/AgregarImpuesto';
 // Asegúrate de que la ruta sea correcta

export const ProductosPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nombre: '', categoria: '', precio: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [errorForm, setErrorForm] = useState(null);

  const [impuestos, setImpuestos] = useState({});
  const [showImpuestoModal, setShowImpuestoModal] = useState(false);

  const API_URL = 'http://localhost:8080/api/productos';

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  useEffect(() => {
    const cats = localStorage.getItem('categorias');
    if (cats) setCategorias(JSON.parse(cats));

    const imp = localStorage.getItem('impuestos');
    if (imp) setImpuestos(JSON.parse(imp));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    if (!form.nombre.trim()) return setErrorForm('El nombre es obligatorio');
    if (!form.categoria.trim()) return setErrorForm('La categoría es obligatoria');
    if (!form.precio || isNaN(form.precio) || parseFloat(form.precio) <= 0)
      return setErrorForm('El precio debe ser un número positivo');
    if (!form.stock || isNaN(form.stock) || parseInt(form.stock, 10) < 0)
      return setErrorForm('El stock debe ser un número igual o mayor a 0');

    setErrorForm(null);
    return true;
  };

  const handleAddOrUpdate = async () => {
    if (!validateForm()) return;

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
      setErrorForm('Error al guardar producto');
    }
  };

  const handleEdit = (product) => {
    setForm({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: product.precio,
      stock: product.stock,
    });
    setEditId(product.id);
    setShowModal(true);
    setErrorForm(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const handleGuardarImpuesto = (productoId, porcentaje) => {
    const nuevos = { ...impuestos, [productoId]: porcentaje };
    setImpuestos(nuevos);
    localStorage.setItem('impuestos', JSON.stringify(nuevos));
  };

  const getEstado = (stock) => {
    if (stock === 0) return <Badge bg="danger">Sin stock</Badge>;
    if (stock <= 10) return <Badge bg="warning" text="dark">Pocas unidades</Badge>;
    return <Badge bg="success">Normal</Badge>;
  };

  const filtered = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (precio) => {
    return new Intl.NumberFormat('es-CO').format(Math.round(precio));
  };

  return (
    <div className="p-4">
      <h3>Gestión de Productos</h3>

      <Form.Control
        type="text"
        placeholder="Buscar productos..."
        className="my-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mb-3 d-flex gap-2">
        <Button
          onClick={() => {
            setForm({ nombre: '', categoria: '', precio: '', stock: '' });
            setEditId(null);
            setShowModal(true);
            setErrorForm(null);
          }}
          variant="primary"
        >
          Agregar Producto
        </Button>

        <Button variant="secondary" onClick={() => setShowImpuestoModal(true)}>
          Asignar Impuesto
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio Base</th>
            <th>Impuesto %</th>
            <th>Precio Final</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((product, index) => {
  const precioBase = parseFloat(product.precio);
  const impuesto = impuestos[product.id] || 0;
  const precioFinal = precioBase + (precioBase * impuesto) / 100;

  return (
    <tr key={product.id}>
      <td>{index + 1}</td>
      <td>{product.nombre}</td>
      <td>{product.categoria}</td>
      <td>${formatPrice(precioBase)}</td>
      <td>{impuesto}%</td>
      <td>${formatPrice(precioFinal)}</td>
      <td>{product.stock}</td>
      <td>{getEstado(product.stock)}</td>
      <td>
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleEdit(product)}
          className="me-2"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDelete(product.id)}
        >
          Eliminar
        </Button>
      </td>
    </tr>
  );
})}

        </tbody>
      </Table>

      {/* Modal Producto */}
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
              className="mb-3"
            />

            <Form.Select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="mb-3"
            >
              <option value="">-- Selecciona categoría --</option>
              {categorias.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>

            <Form.Control
              name="precio"
              placeholder="Precio"
              type="number"
              value={form.precio}
              onChange={handleChange}
              className="mb-3"
            />

            <Form.Control
              name="stock"
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="mb-3"
            />

            {errorForm && <div className="text-danger mb-2">{errorForm}</div>}
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

      {/* Modal Impuesto */}
      <AgregarImpuesto
        show={showImpuestoModal}
        onClose={() => setShowImpuestoModal(false)}
        productos={products}
        onGuardar={handleGuardarImpuesto}
      />
    </div>
  );
};
