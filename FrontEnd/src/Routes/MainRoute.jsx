import { Route, Routes } from "react-router-dom";
import { Index } from "../Main/Index";
import { Login } from "../Main/Login";
import { CrearCuenta } from "../Main/CrearCuenta";
import { Recovery } from "../Main/Recovery";
import { ProductosRoute } from "./ProductosRoute";
import { UsuariosRoute } from "./UsuariosRoute";
import { PedidosRoute } from "./PedidosRoute";
import { ConfiguracionRoute } from "./ConfiguracionRoute";
import { CatalogoRoute } from "./CatalogoRoute";
import { RutaProtegida } from "./RutaProtegida";
import { Catalogo } from "../Users/Catalogo";
import { Carrito } from "../Users/Carrito";
import { Pedidos2Route } from "./Pedidos2Route";
import { Configuracion2Route } from "./Configuracion2Route";
import { FavoritosRoute } from "./FavoritosRoute";
import { CategoriasRoute } from "./CategoriasRoute";
import { EditarUsuarioRoute } from "./EditarUsuarioRoute";

export const MainRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/crearcuenta" element={<CrearCuenta />} />
      <Route path="/recuperar" element={<Recovery />} />
      <Route path="/productos" element={<ProductosRoute />} />
      <Route path="/usuarios" element={<UsuariosRoute />} />
      <Route path="/pedidos" element={<PedidosRoute />} />
      <Route path="/configuracion" element={<ConfiguracionRoute />} />
      <Route path="/configuracion2" element={<Configuracion2Route />} />
      <Route path="/catalogo" element={<CatalogoRoute />} />
      <Route path="/pedidosCliente" element={<Pedidos2Route />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/favoritos" element={<FavoritosRoute />} />
      <Route path="/categorias" element={<CategoriasRoute />} />
      <Route path="/favoritos" element={<FavoritosRoute />} />
      <Route path="/Config" element={<EditarUsuarioRoute />} />
      

      <Route
  path="/catalogo"
  element={
    <RutaProtegida>
      <Catalogo />
    </RutaProtegida>
  }
/>
    </Routes>
  );
};
