import React, { useEffect, useState } from 'react';
import ConfirmRole from './ConfirmRole';
import { Navigate } from 'react-router-dom';


const ProtectedRoute = ({ children, allowedRoles = [], disableRender = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // `null` para la verificación en proceso
  const token = localStorage.getItem('accessToken');

  

  useEffect(() => {
    const checkAuthorization = () => {
      if (!token) {
        setIsAuthorized(false); // Si no hay token, no está autorizado
        return;
      }

      
      

      // Si no se especifican roles permitidos, se permite el acceso
      if (allowedRoles.length === 0) {
        setIsAuthorized(true);
        return;
      }

      try {
        
        const userRole = ConfirmRole.getRoleFromToken(token); // Utiliza la clase ConfirmRole para obtener el rol del usuario
        
        // Verifica si el rol del usuario está en la lista de roles permitidos
        setIsAuthorized(allowedRoles.includes(userRole));
      } catch (err) {
        console.error('Error al decodificar el token:', err);
        setIsAuthorized(false); // Si hay error, se niega el acceso
      }
    };

    checkAuthorization();
  
  }, [allowedRoles, token]);

 // Mientras se verifica el rol, muestra un mensaje de carga
 if (isAuthorized === null) return <p>Verificando acceso...</p>;

 // Si disableRender es true, no renderiza los hijos y no hace nada más
 if (disableRender && !isAuthorized) return null;

 // Redirección según si hay token o no, y si tiene permisos
 if (!isAuthorized) return <Navigate to={token ? "/unauthorized" : "/login"} />;

 return children;
};

export default ProtectedRoute;
