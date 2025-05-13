import { NavBar } from "../components/NavBar"
import { ConfiguracionPage } from "../Admin/ConfiguracionPage"

export const ConfiguracionRoute = () => {
  return (
<div className="d-flex">
      <NavBar />
      <div className="flex-grow-1 p-4">
        {/* Aquí va el contenido principal */}
        <ConfiguracionPage />
      </div>
      
    </div> 
    )
}