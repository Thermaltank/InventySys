import { NavBar } from "../components/NavBar"
import { PedidosPage } from "../Admin/PedidosPage"

export const PedidosRoute = () => {
  return (
<div className="d-flex">
      <NavBar />
      <div className="flex-grow-1 p-4">
        {/* Aquí va el contenido principal */}
        <PedidosPage />
      </div>
      
    </div> 
    )
}