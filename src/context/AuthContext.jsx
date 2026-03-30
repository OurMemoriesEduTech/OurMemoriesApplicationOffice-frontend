import React, {createContext, useState, useContext, useEffect} from 'react';
import axios from 'axios';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verify token once on initial load or refresh
    useEffect(() => {
        const verifyToken = async () => {
            try {
                console.log('Verifying session token'); // Debug log
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/auth/verify-token`, {
                    withCredentials: true,
                });
                const { success } = response.data || {};
                if (success?.userInformation) {
                    setIsAuthenticated(true);
                    setUser(success.userInformation);
                    console.log('Session restored:', success.userInformation); // Debug log
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (err) {
                console.error('Session verification failed:', err.response?.data?.fail || err.message); // Debug log
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, []); // Empty array: runs only on mount


    const login = async (email, password) => {
        console.log('Logging in user:', { email }); // Debug log
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/auth/login`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            const { success } = response.data;
            setIsAuthenticated(true);
            setUser(success.userInformation); // e.g., { email, name, token }
            console.log('Login successful:', success.userInformation); // Debug log
        } catch (err) {
            console.error('Login error:', err.response?.data?.fail || err.message); // Debug log
            throw new Error(err.response?.data?.fail || 'Login failed');
        }
    };

    const signup = async (firstName,lastName,phoneNumber, email, password) => {
        console.log('Signing up user:', { firstName,lastName,phoneNumber, email }); // Debug log
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/auth/signup`,
                { firstName,lastName,phoneNumber, email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
            const { success } = response.data;
            //alert(success.message);
        } catch (err) {
            console.error('Signup error:', err.response?.data?.fail || err.message); // Debug log
            throw new Error(err.response?.data?.fail || 'Sign up failed');
        }
    };

    const logout = async () => {
        console.log('Logging out user'); // Debug log
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/auth/logout`,
                {},
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            console.log('Logout successful'); // Debug log
        } catch (err) {
            console.error('Logout error:', err.response?.data?.fail || err.message); // Debug log
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user,loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
