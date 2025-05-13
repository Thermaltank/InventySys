import { NavBar2 } from "../components/NavBar2"
import { Favoritos } from "../Users/Favoritos"

export const FavoritosRoute = () => {
  return (
<div className="d-flex">
          <NavBar2 />
          <div className="flex-grow-1 p-4">
            {/* Aquí va el contenido principal */}
            <Favoritos />
          </div>
          
        </div>   )
}
