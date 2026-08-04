import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
} from "../services/customerService";
import type { Customer } from "../types/Customer";
import { useAuth } from "../context/AuthContext";

const Customers = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        points: 0,
    });

    const fetchCustomersData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCustomers();
            setCustomers(data);
        } catch (err: unknown) {
            console.error("Lỗi khi tải danh sách khách hàng:", err);
            setError("Không thể tải danh sách khách hàng. Vui lòng kiểm tra json-server!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomersData();
    }, []);

    // Filter customers
    const filteredCustomers = customers.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery) ||
            (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const handleOpenAddModal = () => {
        setModalMode("add");
        setFormData({
            name: "",
            phone: "",
            email: "",
            points: 0,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (customer: Customer) => {
        setModalMode("edit");
        setEditingId(customer.id);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || "",
            points: customer.points,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "points" ? Number(value) : value,
        }));
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }

        // Kiểm tra số điện thoại bị trùng (đối với thêm mới hoặc sửa sang số khác)
        const phoneExists = customers.some(
            (c) => c.phone === formData.phone && c.id !== editingId
        );
        if (phoneExists) {
            alert("Số điện thoại này đã được đăng ký cho khách hàng khác!");
            return;
        }

        setSubmitting(true);
        try {
            if (modalMode === "add") {
                const newCust: Customer = {
                    id: "CUST-" + Date.now(),
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || undefined,
                    points: Number(formData.points) || 0,
                    createdAt: new Date().toISOString(),
                };
                await addCustomer(newCust);
            } else if (modalMode === "edit" && editingId) {
                const existing = customers.find((c) => c.id === editingId);
                if (existing) {
                    const updatedCust: Customer = {
                        ...existing,
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email || undefined,
                        points: Number(formData.points) || 0,
                    };
                    await updateCustomer(editingId, updatedCust);
                }
            }
            await fetchCustomersData();
            handleCloseModal();
        } catch (err) {
            console.error("Lỗi khi lưu khách hàng:", err);
            alert("Có lỗi xảy ra khi lưu thông tin khách hàng.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCustomer = async (id: string, name: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xoá khách hàng "${name}" không?`)) {
            return;
        }

        try {
            await deleteCustomer(id);
            await fetchCustomersData();
        } catch (err) {
            console.error("Lỗi khi xoá khách hàng:", err);
            alert("Có lỗi xảy ra khi xoá khách hàng.");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // Thống kê sơ bộ
    const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

    return (
        <div className="container employees-container">
            <div className="employees-header">
                <div>
                    <h1>
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginRight: "10px" }}
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Khách Hàng & Tích Điểm
                    </h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                        Quản lý hồ sơ khách hàng thành viên và điểm tích luỹ mua sắm.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddModal}>
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: "6px" }}
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Thêm khách hàng
                </button>
            </div>

            {/* Thẻ thống kê nhanh */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                }}
            >
                <div className="stat-card" style={{ padding: "16px 20px" }}>
                    <span className="stat-title">Tổng số khách hàng</span>
                    <span className="stat-value">{customers.length}</span>
                </div>
                <div className="stat-card" style={{ padding: "16px 20px" }}>
                    <span className="stat-title">Tổng số điểm tích lũy</span>
                    <span className="stat-value" style={{ color: "#f59e0b" }}>
                        {totalPoints.toLocaleString("vi-VN")}
                    </span>
                </div>
            </div>

            {/* Thanh lọc & tìm kiếm */}
            <div className="employees-filters" style={{ marginBottom: "20px" }}>
                <div className="search-wrapper" style={{ flex: 1 }}>
                    <svg
                        className="search-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm theo Tên, Số điện thoại hoặc Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <div className="sales-spinner" style={{ margin: "auto", marginBottom: "12px" }} />
                    <p>Đang tải dữ liệu khách hàng...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th style={{ textAlign: "center" }}>Điểm tích luỹ</th>
                                <th>Ngày đăng ký</th>
                                <th style={{ textAlign: "right" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((cust) => (
                                <tr key={cust.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div
                                                style={{
                                                    width: "36px",
                                                    height: "36px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "var(--primary-light, #dbeafe)",
                                                    color: "var(--primary, #2563eb)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "700",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                {cust.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{cust.name}</span>
                                        </div>
                                    </td>
                                    <td>{cust.phone}</td>
                                    <td>{cust.email || <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>chưa cập nhật</span>}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <span
                                            className="badge"
                                            style={{
                                                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                                color: "#fff",
                                                fontWeight: "bold",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "13px",
                                                boxShadow: "0 2px 4px rgba(217, 119, 6, 0.2)",
                                            }}
                                        >
                                            {cust.points}
                                        </span>
                                    </td>
                                    <td>{formatDate(cust.createdAt)}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "inline-flex", gap: "8px" }}>
                                            <button
                                                onClick={() => handleOpenEditModal(cust)}
                                                className="btn btn-icon-only"
                                                title="Sửa thông tin"
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                                                className="btn btn-icon-only"
                                                style={{ color: "var(--danger)" }}
                                                title="Xoá khách hàng"
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                                        Không tìm thấy khách hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL FORM POPUP */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Đóng">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" x2="6" y1="6" y2="18" />
                                <line x1="6" x2="18" y1="6" y2="18" />
                            </svg>
                        </button>

                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>
                            {modalMode === "add" ? "Thêm Khách Hàng Mới" : "Sửa Thông Tin Khách Hàng"}
                        </h2>

                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="cust-name">
                                    Họ và tên *
                                </label>
                                <input
                                    id="cust-name"
                                    name="name"
                                    type="text"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cust-phone">
                                    Số điện thoại *
                                </label>
                                <input
                                    id="cust-phone"
                                    name="phone"
                                    type="text"
                                    placeholder="Ví dụ: 0987654321"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cust-email">
                                    Email
                                </label>
                                <input
                                    id="cust-email"
                                    name="email"
                                    type="email"
                                    placeholder="Ví dụ: vana@gmail.com"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cust-points">
                                    Điểm tích luỹ
                                </label>
                                <input
                                    id="cust-points"
                                    name="points"
                                    type="number"
                                    min="0"
                                    placeholder="Điểm số ban đầu"
                                    className="form-control"
                                    value={formData.points}
                                    onChange={handleInputChange}
                                    disabled={!isAdmin && modalMode === "edit"} // Chỉ Admin mới được chỉnh sửa điểm số trực tiếp ở mode edit
                                />
                                {!isAdmin && modalMode === "edit" && (
                                    <small style={{ color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                                        Chỉ Admin mới có quyền điều chỉnh điểm tích luỹ thủ công.
                                    </small>
                                )}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                    marginTop: "24px",
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? "Đang lưu..." : "Lưu lại"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
