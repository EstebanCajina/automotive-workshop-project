class ConfirmRole {
  static decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Reemplazar caracteres de URL a base64
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  static getRoleFromToken(token) {
    if (!token) {
      return null;
    }

    try {
      const decodedToken = this.decodeJWT(token);
      return decodedToken.user?.role || null; // Extrae el rol del token
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  static getUserFromToken(token) {
    if (!token) {
      return null;
    }

    try {
      const decodedToken = this.decodeJWT(token);
      return decodedToken.user || null; // Devuelve toda la información del usuario
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

export default ConfirmRole;