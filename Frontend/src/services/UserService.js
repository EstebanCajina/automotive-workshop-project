import api from '../components/Auth/AxiosConfig';

// Obtener todos los usuarios

export const getUsers = async () => {
    try {
        const response = await api.get('users');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        throw error;
    }
    }

// Obtener un usuario por su ID
export const getUserById = async (id
    ) => {
    try {
        const response = await api.get(`users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el usuario con ID ${id}:`, error);
        throw error;
    }
}

// Agregar un nuevo usuario
export const addUser = async (user) => {
    try {
        const response = await api.post('users', user);
        return response.data;
    } catch (error) {
        console.error('Error al agregar el usuario:', error);
        throw error;
    }
}

// Actualizar un usuario existente
export const updateUser = async (id, updatedUser) => {
    try {
        const response = await api.put(`users/${id}`, updatedUser);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el usuario con ID ${id}:`, error);
        throw error;
    }
}

// Eliminar un usuario (eliminación lógica)
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el usuario con ID ${id}:`, error);
        throw error;
    }
}

export const verifyExistentUserName = async (username) => {
    try {
        const response = await api.get(`users/validUsername/${username}`);
        return response.data;
    } catch (error) {
        console.error(`Error al verificar el usuario ${username}:`, error);
        throw error;
    }
}

export const updateProfilePicture = async (id, profileFile) => {
    try {
        const formData = new FormData();
        formData.append('profile_picture', profileFile);

        await api.put(`users/updateProfilePicture/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        console.error(`Error al actualizar la foto de perfil del usuario con ID ${id}:`, error);
        throw error;
    }
}

export const login = async (formData) => {
    try {
        const response = await api.post('users/login', formData, {
            withCredentials: true, // Habilita el envío de cookies
        });

        const { token } = response.data;

        if (token) {
            // Almacenar el session_token en localStorage
            localStorage.setItem('accessToken', token);
            
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const closeSession = async () => {
    try {
        await api.post('users/logout', {}, {
            withCredentials: true, // Habilita el envío de cookies
        });
        localStorage.removeItem('accessToken');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
}