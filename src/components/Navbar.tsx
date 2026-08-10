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

    // Style cho menu
    const navLinkStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        whiteSpace: "nowrap" as const,
        flexShrink: 1,
        minWidth: 0,
        paddingLeft: "7px",
        paddingRight: "7px",
    };

    return (
        <nav
            className="navbar"
            style={{
                padding: "0.6rem 1rem",
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                flexWrap: "nowrap",
                overflow: "hidden",
                gap: "8px",
            }}
        >
            {/* ================= LOGO ================= */}
            <Link
                to="/"
                className="navbar-brand"
                style={{
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginRight: "2px",
                }}
            >
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

            {/* ================= MENU ================= */}
            <div
                className="navbar-menu"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "8px",
                    flex: "1 1 auto",
                    minWidth: 0,
                    flexWrap: "nowrap",
                    overflow: "hidden",
                }}
            >
                {/* TRANG CHỦ */}
                <Link
                    to="/"
                    className={`navbar-link ${
                        location.pathname === "/" ? "active" : ""
                    }`}
                    style={navLinkStyle}
                >
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                    >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Trang chủ</span>
                </Link>

                {/* SẢN PHẨM */}
                <Link
                    to="/products"
                    className={`navbar-link ${
                        location.pathname === "/products" ? "active" : ""
                    }`}
                    style={navLinkStyle}
                >
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                    >
                        <path d="M12 2H2v10h10V2Z" />
                        <path d="M22 2h-10v10h10V2Z" />
                        <path d="M12 12H2v10h10V12Z" />
                        <path d="M22 12h-10v10h10V12Z" />
                    </svg>
                    <span>Sản phẩm</span>
                </Link>

                {/* NHÂN VIÊN */}
                {user?.role === "admin" && (
                    <Link
                        to="/employees"
                        className={`navbar-link ${
                            location.pathname === "/employees"
                                ? "active"
                                : ""
                        }`}
                        style={navLinkStyle}
                    >
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ flexShrink: 0 }}
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>Nhân viên</span>
                    </Link>
                )}

                {/* KHÁCH HÀNG */}
                <Link
                    to="/customers"
                    className={`navbar-link ${
                        location.pathname === "/customers" ? "active" : ""
                    }`}
                    style={navLinkStyle}
                >
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                    >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Khách hàng</span>
                </Link>

                {/* BÁN HÀNG */}
                <Link
                    to="/sales"
                    className={`navbar-link ${
                        location.pathname === "/sales" ? "active" : ""
                    }`}
                    style={navLinkStyle}
                >
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                    >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span>Bán hàng</span>
                </Link>

                {/* LỊCH SỬ */}
                <Link
                    to="/sales-history"
                    className={`navbar-link ${
                        location.pathname === "/sales-history"
                            ? "active"
                            : ""
                    }`}
                    style={navLinkStyle}
                >
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                    >
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>Lịch sử & Thống kê</span>
                </Link>

                {/* THÊM SẢN PHẨM */}
                {user?.role === "admin" && (
                    <Link
                        to="/products/add"
                        className={`navbar-link ${
                            location.pathname === "/products/add"
                                ? "active"
                                : ""
                        }`}
                        style={navLinkStyle}
                    >
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ flexShrink: 0 }}
                        >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                        <span>Thêm sản phẩm</span>
                    </Link>
                )}

                {/* ================= THEME ================= */}
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    title={
                        isDark
                            ? "Chuyển sang Giao diện Sáng"
                            : "Chuyển sang Giao diện Tối"
                    }
                    aria-label="Đổi giao diện"
                    style={{
                        flexShrink: 0,
                        marginLeft: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {isDark ? (
                        <svg
                            width="19"
                            height="19"
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
                            width="19"
                            height="19"
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
            </div>

            {/* ================= USER + LOGOUT ================= */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                    minWidth: "fit-content",
                    marginLeft: "4px",
                }}
            >
                {isAuthenticated && user ? (
                    <>
                        {/* PROFILE */}
                        <Link
                            to="/profile"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                                padding: "4px 8px 4px 5px",
                                borderRadius: "30px",
                                backgroundColor: isDark
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "rgba(0, 0, 0, 0.05)",
                                border: isDark
                                    ? "1px solid rgba(255, 255, 255, 0.12)"
                                    : "1px solid rgba(0, 0, 0, 0.08)",
                                textDecoration: "none",
                                color: "inherit",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                            title="Xem hồ sơ & Đổi mật khẩu"
                        >
                            <img
                                src={
                                    user.avatar ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                                }
                                alt={user.name}
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    boxShadow:
                                        "0 2px 4px rgba(0,0,0,0.2)",
                                    flexShrink: 0,
                                }}
                            />

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    lineHeight: "1.2",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: "700",
                                    }}
                                >
                                    {user.name}
                                </span>

                                <span
                                    style={{
                                        width: "fit-content",
                                        fontSize: "9px",
                                        fontWeight: "800",
                                        letterSpacing: "0.4px",
                                        padding: "2px 5px",
                                        marginTop: "2px",
                                        borderRadius: "10px",
                                        textTransform: "uppercase",
                                        color: "#ffffff",
                                        background:
                                            user.role === "admin"
                                                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                        boxShadow:
                                            "0 2px 4px rgba(0,0,0,0.15)",
                                    }}
                                >
                                    {user.role === "admin"
                                        ? "👑 ADMIN"
                                        : "🧑‍💼 NHÂN VIÊN"}
                                </span>
                            </div>
                        </Link>

                        {/* ĐĂNG XUẤT */}
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: "8px 11px",
                                borderRadius: "20px",
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                border: "none",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "3px",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                minWidth: "96px",
                            }}
                            title="Thoát tài khoản"
                        >
                            🚪 Đăng xuất
                        </button>
                    </>
                ) : (
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
                            whiteSpace: "nowrap",
                        }}
                    >
                        Đăng nhập
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;