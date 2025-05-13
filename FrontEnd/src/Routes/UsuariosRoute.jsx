import { NavBar } from "../components/NavBar"
import { UsuariosPage } from "../Admin/UsuariosPage"

export const UsuariosRoute = () => {
  return (
<div className="d-flex">
      <NavBar />
      <div className="flex-grow-1 p-4">
        {/* Aquí va el contenido principal */}
        <UsuariosPage />
      </div>
      
    </div> 
    )
}