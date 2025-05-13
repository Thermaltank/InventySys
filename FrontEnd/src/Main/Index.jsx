import { Link } from "react-router-dom";

export const Index = () => {

    

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
          <div className="card shadow p-4" style={{ width: '400px' }}>
            <div className="card-body text-center">
              <h4 className="fw-bold">InventySas</h4>
              <p className="text-muted">Sistema de Gestión de Inventario</p>
              <h5 className="fw-bold mt-4">Seleccione tipo de acceso</h5>
              <div className="d-flex justify-content-around mt-4">
                <div
                  className="border rounded p-3 mx-2 hover-shadow"
                  style={{ width: '45%', textDecoration: 'none' }}
                  
                >
                    <Link to="/pedidos" style={{ textDecoration: 'none', color: 'inherit' }}>
                    
                  <div className="mb-2">
                    <span style={{ fontSize: '2rem' }}>🧑‍💼</span>
                  </div>
                  <h6 className="fw-bold">Administrador</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                
                  </p>
                  </Link>

                </div>
                <div
                  className="border rounded p-3 mx-2"
                  style={{ width: '45%' }}
                 
                >
                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="mb-2">
                    <span style={{ fontSize: '2rem' }}>👤</span>
                  </div>
                  <h6 className="fw-bold">Cliente</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
