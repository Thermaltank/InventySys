import { NavBar } from "../components/NavBar"
import { PedidosPage } from "../Admin/PedidosPage"

export const PedidosRoute = () => {
  return (
<div className="d-flex" style={{ height: "100vh" }}>
      {/* Sidebar fijo a la izquierda */}
      <NavBar />

      {/* Contenedor derecho: header arriba + contenido abajo */}
      <div className="d-flex flex-column flex-grow-1">
        {/* Header */}

        {/* Contenido principal con scroll si hace falta */}
        <div className="flex-grow-1 p-4 overflow-auto">
          <PedidosPage />
        </div>
      </div>
    </div>
    )
}