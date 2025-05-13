import { NavBar2 } from "../components/NavBar2"
import { Configuracion } from "../Users/Configuracion"

export const Configuracion2Route = () => {
  return (
    <div className="d-flex">
          <NavBar2 />
          <div className="flex-grow-1 p-4">
            {/* Aquí va el contenido principal */}
            <Configuracion />
          </div>
          
        </div> 
  )
}
