import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { Carrito } from "../Users/Carrito";

export const BotonCarrito = () => {
  const [mostrar, setMostrar] = useState(false);

  return (
    <>
      <button
        className="bg-primary"
        onClick={() => setMostrar(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          fontSize: "24px",
          zIndex: 1050,
        }}
      >
        <FaShoppingCart />
      </button>

      <Carrito show={mostrar} onHide={() => setMostrar(false)} />
    </>
  );
};
