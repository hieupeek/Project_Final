import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePasswordApi } from "../services/authService";

export default function Profile() {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!user) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>Vui lòng đăng nhập để xem trang này</h2>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setMessage({ type: "error", text: "Vui lòng nhập đầy đủ các trường!" });
            return;
        }

        if (newPassword.length < 3) {
            setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 3 ký tự!" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Xác nhận mật khẩu mới không khớp!" });
            return;
        }

        try {
            setSubmitting(true);
            await changePasswordApi(user.id, currentPassword, newPassword);
            setMessage({ type: "success", text: "Thay đổi mật khẩu thành công!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage({ type: "error", text: err.message });
            } else {
                setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại!" });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1>Hồ Sơ Cá Nhân 🧑‍💼</h1>
            
            <div style={styles.grid}>
                {/* User Info Card */}
                <div className="product-card" style={styles.card}>
                    <div style={styles.avatarSection}>
                        <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                            alt={user.name}
                            style={styles.avatar}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop";
                            }}
                        />
                        <span
                            style={{
                                ...styles.roleBadge,
                                background:
                                    user.role === "admin"
                                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            }}
                        >
                            {user.role === "admin" ? "👑 Admin" : "🧑‍💼 Nhân viên"}
                        </span>
                    </div>

                    <div style={styles.infoSection}>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Họ và tên:</span>
                            <span style={styles.infoValue}>{user.name}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Email:</span>
                            <span style={styles.infoValue}>{user.email}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Mã định danh:</span>
                            <span style={styles.infoValue}>{user.id}</span>
                        </div>
                    </div>
                </div>

                {/* Change Password Form Card */}
                <div className="product-card" style={styles.card}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "20px" }}>Đổi mật khẩu</h2>
                    
                    {message && (
                        <div
                            style={{
                                ...styles.alert,
                                backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                color: message.type === "success" ? "var(--success)" : "var(--danger)",
                                borderColor: message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="current-password">
                                Mật khẩu hiện tại *
                            </label>
                            <input
                                id="current-password"
                                type="password"
                                className="form-control"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="new-password">
                                Mật khẩu mới *
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirm-password">
                                Xác nhận mật khẩu mới *
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginTop: "24px" }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: "100%" }}
                                disabled={submitting}
                            >
                                {submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: "900px",
        margin: "0 auto",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
        marginTop: "24px",
    },
    card: {
        padding: "30px",
        display: "flex",
        flexDirection: "column",
    },
    avatarSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "24px",
    },
    avatar: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        objectFit: "cover",
        marginBottom: "16px",
        border: "4px solid var(--border-color)",
        boxShadow: "var(--shadow-md)",
    },
    roleBadge: {
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "0.5px",
        padding: "4px 12px",
        borderRadius: "20px",
        textTransform: "uppercase",
        color: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    },
    infoSection: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "10px",
    },
    infoLabel: {
        color: "var(--text-muted)",
        fontWeight: "500",
    },
    infoValue: {
        fontWeight: "700",
    },
    alert: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid",
        marginBottom: "20px",
        fontSize: "14px",
        fontWeight: "500",
    },
};
