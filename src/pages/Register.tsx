import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/User";

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<UserRole>("employee");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
            return;
        }

        if (password.length < 3) {
            setError("Mật khẩu phải chứa ít nhất 3 ký tự!");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu nhập lại không khớp!");
            return;
        }

        try {
            setSubmitting(true);
            await register({
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                role,
            });
            navigate("/products", { replace: true });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Đăng ký không thành công!");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoBadge}>✨</div>
                    <h1 style={styles.title}>Đăng Ký Tài Khoản</h1>
                    <p style={styles.subtitle}>Tạo tài khoản sử dụng hệ thống quản lý</p>
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
                        <label style={styles.label}>Họ và Tên *</label>
                        <input
                            type="text"
                            placeholder="Nhập họ và tên..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Địa chỉ Email *</label>
                        <input
                            type="email"
                            placeholder="user@supermarket.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mật khẩu *</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nhập lại mật khẩu *</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Vai trò / Chức vụ</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            style={styles.select}
                        >
                            <option value="employee">🧑‍💼 Nhân viên (Employee)</option>
                            <option value="admin">👑 Quản trị viên (Admin)</option>
                        </select>
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
                        {submitting ? "Đang tạo tài khoản..." : "Tạo Tài Khoản 🎉"}
                    </button>
                </form>

                {/* Footer Link */}
                <div style={styles.footer}>
                    <span>Đã có tài khoản? </span>
                    <Link to="/login" style={styles.loginLink}>
                        Đăng nhập ngay
                    </Link>
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
        maxWidth: "480px",
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
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "30px",
        margin: "0 auto 16px auto",
        boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.4)",
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
    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
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
    },
    select: {
        padding: "12px 16px",
        borderRadius: "10px",
        backgroundColor: "#0f172a",
        border: "1px solid #334155",
        color: "#ffffff",
        fontSize: "15px",
        outline: "none",
        cursor: "pointer",
    },
    submitBtn: {
        padding: "14px",
        borderRadius: "10px",
        backgroundColor: "#10b981",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "600",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.2s",
        marginTop: "8px",
    },
    footer: {
        textAlign: "center",
        marginTop: "24px",
        fontSize: "14px",
        color: "#94a3b8",
    },
    loginLink: {
        color: "#34d399",
        textDecoration: "none",
        fontWeight: "600",
    },
};
