import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            return savedTheme === "dark";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar" style={{ padding: "0.75rem 1.5rem" }}>
            <Link to="/" className="navbar-brand">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: "4px" }}
                >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                SuperMarket
            </Link>

            <div className="navbar-menu" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link
                    to="/"
                    className={`navbar-link ${
                        location.pathname === "/" ? "active" : ""
                    }`}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Home
                </Link>

                <Link
                    to="/products"
                    className={`navbar-link ${
                        location.pathname === "/products" ? "active" : ""
                    }`}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2H2v10h10V2Z" />
                        <path d="M22 2h-10v10h10V2Z" />
                        <path d="M12 12H2v10h10V12Z" />
                        <path d="M22 12h-10v10h10V12Z" />
                    </svg>
                    Products
                </Link>

                <Link
                    to="/employees"
                    className={`navbar-link ${
                        location.pathname === "/employees" ? "active" : ""
                    }`}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Employees
                </Link>

                <Link
                    to="/products/add"
                    className={`navbar-link ${
                        location.pathname === "/products/add" ? "active" : ""
                    }`}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                    </svg>
                    Add Product
                </Link>

                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.41 1.41" />
                            <path d="m17.66 17.66 1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.34 17.66-1.41 1.41" />
                            <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                    ) : (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    )}
                </button>

                {/* Auth User Profile Badge Section */}
                <div style={{ marginLeft: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                    {isAuthenticated && user ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "4px 10px 4px 6px",
                                    borderRadius: "30px",
                                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
                                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
                                }}
                            >
                                <img
                                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                    alt={user.name}
                                    style={{
                                        width: "34px",
                                        height: "34px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    }}
                                />
                                <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "700" }}>{user.name}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: "800",
                                                letterSpacing: "0.5px",
                                                padding: "2px 6px",
                                                borderRadius: "10px",
                                                textTransform: "uppercase",
                                                color: "#ffffff",
                                                background:
                                                    user.role === "admin"
                                                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                            }}
                                        >
                                            {user.role === "admin" ? "👑 ADMIN" : "🧑‍💼 EMPLOYEE"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: "7px 14px",
                                    borderRadius: "20px",
                                    backgroundColor: "#ef4444",
                                    color: "#ffffff",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)",
                                }}
                                title="Thoát tài khoản"
                            >
                                🚪 Thoát (Logout)
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Link
                                to="/login"
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    backgroundColor: "#2563eb",
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                }}
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    backgroundColor: "#10b981",
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                }}
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;