import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MainRoute } from './Routes/MainRoute'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthProvider>
        <MainRoute />
      </AuthProvider>
    </BrowserRouter>
)
