import { NavBar } from "../components/NavBar"
import {  ProductosPage } from "../Admin/ProductosPage"

export const ProductosRoute = () => {
  return (
<div className="d-flex">
      <NavBar />
      <div className="flex-grow-1 p-4">
        {/* Aquí va el contenido principal */}
        <ProductosPage />
      </div>
      
    </div> 
    )
}
0