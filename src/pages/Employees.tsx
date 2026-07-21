import { useState, useEffect } from "react";
import {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    Employee,
} from "../services/employeeService";

const Employees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "Cashier",
        email: "",
        phone: "",
        avatar: "",
        status: "active" as "active" | "inactive",
    });

    const fetchEmployeesData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getEmployees();
            setEmployees(data);
        } catch (err: unknown) {
            console.error("Lỗi khi tải danh sách nhân viên:", err);
            setError("Không thể tải danh sách nhân viên. Vui lòng kiểm tra json-server!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeesData();
    }, []);

    // Extract dynamic roles
    const roles = Array.from(new Set(employees.map((e) => e.role)));

    // Filters
    const filteredEmployees = employees.filter((e) => {
        const matchesSearch =
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === "" || e.role === selectedRole;
        const matchesStatus = selectedStatus === "" || e.status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleOpenAddModal = () => {
        setModalMode("add");
        setFormData({
            name: "",
            role: "Cashier",
            email: "",
            phone: "",
            avatar: "",
            status: "active",
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (employee: Employee) => {
        setModalMode("edit");
        setEditingId(employee.id);
        setFormData({
            name: employee.name,
            role: employee.role,
            email: employee.email,
            phone: employee.phone,
            avatar: employee.avatar,
            status: employee.status,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
            return;
        }

        // Set dynamic placeholder avatar if empty
        const finalAvatar =
            formData.avatar ||
            `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop`;

        try {
            setSubmitting(true);
            if (modalMode === "add") {
                const newEmp = await addEmployee({
                    name: formData.name,
                    role: formData.role,
                    email: formData.email,
                    phone: formData.phone,
                    avatar: finalAvatar,
                    status: formData.status,
                });
                setEmployees([newEmp, ...employees]);
            } else if (modalMode === "edit" && editingId !== null) {
                const updated = await updateEmployee(editingId, {
                    name: formData.name,
                    role: formData.role,
                    email: formData.email,
                    phone: formData.phone,
                    avatar: finalAvatar,
                    status: formData.status,
                });
                setEmployees(
                    employees.map((emp) => (emp.id === editingId ? updated : emp))
                );
            }
            handleCloseModal();
        } catch (err: unknown) {
            console.error("Lỗi khi lưu nhân viên:", err);
            alert("Không thể lưu thông tin nhân viên. Vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEmployee = async (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa nhân viên ${name}?`)) {
            try {
                await deleteEmployee(id);
                setEmployees(employees.filter((emp) => emp.id !== id));
            } catch (err: unknown) {
                console.error("Lỗi khi xóa nhân viên:", err);
                alert("Không thể xóa nhân viên này. Vui lòng kiểm tra lại backend!");
            }
        }
    };

    // Render Role Badge Color
    const getRoleBadgeClass = (role: string) => {
        switch (role.toLowerCase()) {
            case "manager":
                return "badge-primary";
            case "cashier":
                return "badge-success";
            case "stocker":
                return "badge-warning";
            case "security":
                return "badge-secondary";
            default:
                return "badge-primary";
        }
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                }}
            >
                <h1>
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Employees Directory
                </h1>
                <button onClick={handleOpenAddModal} className="btn btn-primary">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                    </svg>
                    Add Employee
                </button>
            </div>

            <div className="toolbar">
                <div className="search-filter-group">
                    <div className="search-wrapper">
                        <svg
                            className="search-icon"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search name, role, email..."
                            className="form-control search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-control filter-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{ minWidth: "140px" }}
                    >
                        <option value="">All Roles</option>
                        {roles.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-control filter-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{ minWidth: "140px" }}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="view-toggle-group">
                    <button
                        className={`view-toggle-btn ${
                            viewMode === "grid" ? "active" : ""
                        }`}
                        onClick={() => setViewMode("grid")}
                        title="Grid View"
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
                            <rect width="7" height="7" x="3" y="3" rx="1" />
                            <rect width="7" height="7" x="14" y="3" rx="1" />
                            <rect width="7" height="7" x="14" y="14" rx="1" />
                            <rect width="7" height="7" x="3" y="14" rx="1" />
                        </svg>
                    </button>
                    <button
                        className={`view-toggle-btn ${
                            viewMode === "table" ? "active" : ""
                        }`}
                        onClick={() => setViewMode("table")}
                        title="List View"
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
                            <line x1="3" x2="21" y1="6" y2="6" />
                            <line x1="3" x2="21" y1="12" y2="12" />
                            <line x1="3" x2="21" y1="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {filteredEmployees.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="8" x2="16" y1="12" y2="12" />
                        </svg>
                    </span>
                    <h2>No employees found</h2>
                    <p>Try adjusting your search query or role/status filters.</p>
                </div>
            ) : viewMode === "grid" ? (
                /* GRID VIEW */
                <div className="products-grid">
                    {filteredEmployees.map((emp) => (
                        <div key={emp.id} className="card employee-card">
                            <div className="employee-avatar-wrapper">
                                <img
                                    src={emp.avatar}
                                    alt={emp.name}
                                    className="employee-avatar"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop";
                                    }}
                                />
                            </div>
                            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 4px" }}>
                                {emp.name}
                            </h3>
                            <div style={{ marginBottom: "12px" }}>
                                <span className={`badge ${getRoleBadgeClass(emp.role)}`} style={{ marginRight: "6px" }}>
                                    {emp.role}
                                </span>
                                <span
                                    className={`badge ${
                                        emp.status === "active"
                                            ? "badge-success"
                                            : "badge-danger"
                                    }`}
                                    style={{ background: emp.status === "inactive" ? "rgba(100, 116, 139, 0.1)" : "", color: emp.status === "inactive" ? "var(--text-muted)" : "" }}
                                >
                                    {emp.status}
                                </span>
                            </div>

                            <div className="employee-details">
                                <div className="employee-detail-item">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                        {emp.email}
                                    </span>
                                </div>
                                <div className="employee-detail-item">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 9v3Z" />
                                    </svg>
                                    <span>{emp.phone}</span>
                                </div>
                            </div>

                            <div className="product-card-actions" style={{ marginTop: "20px" }}>
                                <button
                                    onClick={() => handleOpenEditModal(emp)}
                                    className="btn btn-secondary"
                                    title="Edit"
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
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                    className="btn btn-danger"
                                    title="Delete"
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
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* TABLE VIEW */
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id}>
                                    <td>
                                        <img
                                            src={emp.avatar}
                                            width={44}
                                            height={44}
                                            alt={emp.name}
                                            style={{ borderRadius: "50%" }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop";
                                            }}
                                        />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                                    <td>
                                        <span className={`badge ${getRoleBadgeClass(emp.role)}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td>{emp.email}</td>
                                    <td>{emp.phone}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                emp.status === "active"
                                                    ? "badge-success"
                                                    : "badge-danger"
                                            }`}
                                            style={{ background: emp.status === "inactive" ? "rgba(100, 116, 139, 0.1)" : "", color: emp.status === "inactive" ? "var(--text-muted)" : "" }}
                                        >
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div
                                            style={{
                                                display: "inline-flex",
                                                gap: "8px",
                                            }}
                                        >
                                            <button
                                                onClick={() => handleOpenEditModal(emp)}
                                                className="btn btn-icon-only"
                                                title="Edit"
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
                                                onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                                className="btn btn-icon-only"
                                                style={{
                                                    color: "var(--danger)",
                                                }}
                                                title="Delete"
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
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL FORM POPUP */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Close modal">
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
                            {modalMode === "add" ? "Add New Employee" : "Edit Employee Details"}
                        </h2>

                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="emp-name">
                                    Họ tên *
                                </label>
                                <input
                                    id="emp-name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g. Nguyễn Văn A"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="emp-role">
                                        Chức vụ
                                    </label>
                                    <select
                                        id="emp-role"
                                        name="role"
                                        className="form-control"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Manager">Manager</option>
                                        <option value="Cashier">Cashier</option>
                                        <option value="Stocker">Stocker</option>
                                        <option value="Security">Security</option>
                                        <option value="Accountant">Accountant</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="emp-status">
                                        Trạng thái
                                    </label>
                                    <select
                                        id="emp-status"
                                        name="status"
                                        className="form-control"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="emp-email">
                                    Email *
                                </label>
                                <input
                                    id="emp-email"
                                    name="email"
                                    type="email"
                                    placeholder="e.g. email@supermarket.com"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="emp-phone">
                                    Số điện thoại *
                                </label>
                                <input
                                    id="emp-phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="e.g. 0901 234 567"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="emp-avatar">
                                    URL Ảnh đại diện
                                </label>
                                <input
                                    id="emp-avatar"
                                    name="avatar"
                                    type="url"
                                    placeholder="https://example.com/avatar.jpg"
                                    className="form-control"
                                    value={formData.avatar}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-actions" style={{ marginBottom: 0, paddingBottom: 0 }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === "add" ? "Thêm mới" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Employees;
