import { NavBar2 } from "../components/NavBar2"
import { UsuarioHeader } from "../components/UsuarioHeader"

import { Catalogo } from "../Users/Catalogo"

export const CatalogoRoute = () => {
  return (
    <div className="d-flex">
          <NavBar2 />
          <UsuarioHeader />
          <div className="flex-grow-1 p-4">
            {/* Aquí va el contenido principal */}
            <Catalogo />
          </div>
          
        </div> 
  )
}
