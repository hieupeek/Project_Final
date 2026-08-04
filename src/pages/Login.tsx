import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect location after login
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/products";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError("Vui lòng điền đầy đủ Email và Mật khẩu!");
            return;
        }

        try {
            setSubmitting(true);
            await login({ email, password });
            navigate(from, { replace: true });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Đăng nhập thất bại!");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickLogin = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        setError(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoBadge}>🛒</div>
                    <h1 style={styles.title}>Đăng Nhập Hệ Thống</h1>
                    <p style={styles.subtitle}>Hệ thống Quản lý Cửa hàng & Siêu thị</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={styles.errorAlert}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Địa chỉ Email</label>
                        <input
                            type="email"
                            placeholder="admin@supermarket.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.passwordInput}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            ...styles.submitBtn,
                            opacity: submitting ? 0.7 : 1,
                            cursor: submitting ? "not-allowed" : "pointer",
                        }}
                    >
                        {submitting ? "Đang xử lý..." : "Đăng Nhập 🚀"}
                    </button>
                </form>

                {/* Quick Demo Section */}
                <div style={styles.demoSection}>
                    <div style={styles.demoTitle}>💡 Đăng nhập nhanh tài khoản mẫu:</div>
                    <div style={styles.demoButtons}>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin("admin@supermarket.com", "123")}
                            style={styles.demoBtnAdmin}
                        >
                            👑 Admin (Quản trị viên)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin("staff@supermarket.com", "123")}
                            style={styles.demoBtnStaff}
                        >
                            🧑‍💼 Nhân viên
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        width: "100%",
        maxWidth: "440px",
        backgroundColor: "#1e293b",
        borderRadius: "16px",
        padding: "36px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
        border: "1px solid #334155",
        color: "#f8fafc",
    },
    header: {
        textAlign: "center",
        marginBottom: "28px",
    },
    logoBadge: {
        width: "60px",
        height: "60px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "30px",
        margin: "0 auto 16px auto",
        boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.4)",
    },
    title: {
        fontSize: "24px",
        fontWeight: "700",
        margin: "0 0 6px 0",
        color: "#ffffff",
    },
    subtitle: {
        fontSize: "14px",
        color: "#94a3b8",
        margin: 0,
    },
    errorAlert: {
        backgroundColor: "#451a1a",
        border: "1px solid #991b1b",
        color: "#fca5a5",
        padding: "12px 16px",
        borderRadius: "10px",
        fontSize: "14px",
        marginBottom: "20px",
        lineHeight: "1.4",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#cbd5e1",
    },
    input: {
        padding: "12px 16px",
        borderRadius: "10px",
        backgroundColor: "#0f172a",
        border: "1px solid #334155",
        color: "#ffffff",
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s",
    },
    passwordWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    passwordInput: {
        width: "100%",
        padding: "12px 48px 12px 16px",
        borderRadius: "10px",
        backgroundColor: "#0f172a",
        border: "1px solid #334155",
        color: "#ffffff",
        fontSize: "15px",
        outline: "none",
    },
    eyeBtn: {
        position: "absolute",
        right: "12px",
        background: "none",
        border: "none",
        fontSize: "18px",
        cursor: "pointer",
        padding: "4px",
    },
    submitBtn: {
        padding: "14px",
        borderRadius: "10px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "600",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.2s, transform 0.1s",
        marginTop: "8px",
    },
    demoSection: {
        marginTop: "24px",
        paddingTop: "20px",
        borderTop: "1px solid #334155",
    },
    demoTitle: {
        fontSize: "13px",
        color: "#94a3b8",
        marginBottom: "10px",
        fontWeight: "500",
    },
    demoButtons: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
    },
    demoBtnAdmin: {
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: "#312e81",
        border: "1px solid #4338ca",
        color: "#c7d2fe",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },
    demoBtnStaff: {
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: "#064e3b",
        border: "1px solid #047857",
        color: "#a7f3d0",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },
    footer: {
        textAlign: "center",
        marginTop: "24px",
        fontSize: "14px",
        color: "#94a3b8",
    },
    registerLink: {
        color: "#60a5fa",
        textDecoration: "none",
        fontWeight: "600",
    },
};
