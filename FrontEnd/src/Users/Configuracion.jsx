import { Button } from "react-bootstrap"
import { Link } from "react-router-dom"


export const Configuracion = () => {
  return (
    <div><Link
            to="/Config" >

              <Button>


                Configuracion de usuario
              </Button>
            
          </Link>
          
          </div>   
  )
}
