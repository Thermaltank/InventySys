import { EditarUsuario } from "../components/EditarUsuario"
import { NavBar2 } from "../components/NavBar2"

export const EditarUsuarioRoute = () => {
  return (
<div className="d-flex">
          <NavBar2 />
          <div className="flex-grow-1 p-4">
            {/* Aquí va el contenido principal */}
            <EditarUsuario />
          </div>
          
        </div>   )
}
