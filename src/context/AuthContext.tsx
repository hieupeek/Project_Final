import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, LoginCredentials, RegisterData } from "../types/User";
import { loginApi, registerApi, getCurrentUser, logoutApi } from "../services/authService";

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const savedUser = getCurrentUser();
        if (savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const loggedInUser = await loginApi(credentials);
        setUser(loggedInUser);
    };

    const register = async (data: RegisterData) => {
        const newUser = await registerApi(data);
        setUser(newUser);
    };

    const logout = () => {
        logoutApi();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { useAuth } from "./useAuth";
