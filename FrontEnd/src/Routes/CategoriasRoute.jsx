import { Categorias } from "../Admin/Categorias"
import { NavBar } from "../components/NavBar"

export const CategoriasRoute = () => {
  return (
    <div className="d-flex">
        <NavBar />
        <div className="flex-grow-1 p-4">
          {/* Aquí va el contenido principal */}
          <Categorias/>
          </div>
    </div>
  )
}
