import { NavBar2 } from "../components/NavBar2"
import { UsuarioHeader } from "../components/UsuarioHeader"

import { Catalogo } from "../Users/Catalogo"

export const CatalogoRoute = () => {
  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      {/* Sidebar fijo a la izquierda */}
      <NavBar2 />

      {/* Contenedor derecho: header arriba + contenido abajo */}
      <div className="d-flex flex-column flex-grow-1">
        {/* Header */}
        <UsuarioHeader />

        {/* Contenido principal con scroll si hace falta */}
        <div className="flex-grow-1 p-4 overflow-auto">
          <Catalogo />
        </div>
      </div>
    </div>
  )
}
