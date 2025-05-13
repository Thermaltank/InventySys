import { Route, Routes } from "react-router-dom"
import { Login } from "./Login"
import { AdminMain } from "../Admin/AdminMain"
import { Index } from "./Index"


export const IndexRoutes = () => {
  return (
    <>
    
        <Routes>


            <Route path="/" element={<Index/>} />
            <Route path="/admin" element={<AdminMain/>} />
            <Route path="/login" element={<Login/>} />
            

        </Routes>
    
    </>
  )
}
