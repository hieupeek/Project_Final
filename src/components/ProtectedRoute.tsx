import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

interface ProtectedRouteProps {
    children: JSX.Element;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={loadingStyles.container}>
                <div style={loadingStyles.spinner}>⚡ Đang kiểm tra đăng nhập...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user?.role !== "admin") {
        return <Navigate to="/products" replace />;
    }

    return children;
}

const loadingStyles: Record<string, React.CSSProperties> = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontSize: "18px",
        fontWeight: "600",
    },
    spinner: {
        padding: "20px 30px",
        borderRadius: "12px",
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
    },
};
