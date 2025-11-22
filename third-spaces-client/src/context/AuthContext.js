import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import config from '../config/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on initial load
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Decoded token:', decoded);

                // Fetch full user profile
                const fetchUserProfile = async () => {
                    try {
                        const url = `${config.api.baseUrl}${config.api.endpoints.users}/${decoded._id}`;
                        const { data } = await axios.get(url);
                        setUser(data);
                    } catch (error) {
                        console.error('Error fetching user profile:', error);
                        // Fallback to JWT data if profile fetch fails
                        setUser({
                            email: decoded.email,
                            isAdmin: decoded.isAdmin,
                            _id: decoded._id,
                            firstName: decoded.firstName,
                            lastName: decoded.lastName
                        });
                    }
                    setLoading(false);
                };

                fetchUserProfile();
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);

        try {
            const url = `${config.api.baseUrl}${config.api.endpoints.users}/${decoded._id}`;
            const { data } = await axios.get(url);
            setUser(data);
        } catch (error) {
            console.error('Error fetching user profile during login:', error);
            // Fallback to JWT data
            setUser({
                email: decoded.email,
                isAdmin: decoded.isAdmin,
                _id: decoded._id,
                firstName: decoded.firstName,
                lastName: decoded.lastName
            });
        }
    };

    const logout = () => {
        // Clear token from localStorage
        localStorage.removeItem('token');
        // Reset user state
        setUser(null);
    };

    const updateUser = (userData) => {
        // Merge new user data with existing user state
        setUser(prevUser => ({
            ...prevUser,
            ...userData
        }));
    };

    const isAuthenticated = !!user;

    const value = {
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
