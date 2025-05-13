import { NavBar2 } from "../components/NavBar2"
import { Pedidos } from "../Users/Pedidos"

export const Pedidos2Route = () => {
  return (
    <div className="d-flex">
              <NavBar2 />
              <div className="flex-grow-1 p-4">
                {/* Aquí va el contenido principal */}
                <Pedidos />
              </div>
              
            </div> 
  )
}
