import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/Product";
import {
    deleteProduct,
    getProducts,
} from "../services/productService";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
        const savedView = localStorage.getItem("viewMode");
        return (savedView as "grid" | "table") || "grid";
    });

    const loadData = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

        try {
            await deleteProduct(id);
            loadData();
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Có lỗi xảy ra khi xóa sản phẩm.");
        }
    };

    const handleViewChange = (mode: "grid" | "table") => {
        setViewMode(mode);
        localStorage.setItem("viewMode", mode);
    };

    // Extract dynamic categories from products list
    const categories = Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
    );

    // Filter products client-side
    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Format price in VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Render stock status badge
    const renderStockBadge = (quantity: number) => {
        if (quantity === 0) {
            return <span className="badge badge-danger">Hết hàng</span>;
        } else if (quantity <= 10) {
            return <span className="badge badge-warning">Sắp hết hàng ({quantity})</span>;
        } else {
            return <span className="badge badge-success">Còn hàng ({quantity})</span>;
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
                        <path d="M12 2H2v10h10V2Z" />
                        <path d="M22 2h-10v10h10V2Z" />
                        <path d="M12 12H2v10h10V12Z" />
                        <path d="M22 12h-10v10h10V12Z" />
                    </svg>
                    Danh Mục Sản Phẩm
                </h1>
                {isAdmin && (
                    <Link to="/products/add" className="btn btn-primary">
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
                        Thêm sản phẩm
                    </Link>
                )}
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
                            placeholder="Tìm kiếm sản phẩm..."
                            className="form-control search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-control filter-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="view-toggle-group">
                    <button
                        className={`view-toggle-btn ${
                            viewMode === "grid" ? "active" : ""
                        }`}
                        onClick={() => handleViewChange("grid")}
                        title="Hiển thị dạng lưới"
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
                        onClick={() => handleViewChange("table")}
                        title="Hiển thị dạng danh sách"
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

            {filteredProducts.length === 0 ? (
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
                    <h2>Không tìm thấy sản phẩm nào</h2>
                    <p>Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc danh mục.</p>
                </div>
            ) : viewMode === "grid" ? (
                /* GRID VIEW */
                <div className="products-grid">
                    {filteredProducts.map((p) => (
                        <div key={p.id} className="product-card">
                            <div className="product-card-img-wrapper">
                                <span className="product-card-badge">
                                    <span className="badge badge-primary">
                                        {p.category}
                                    </span>
                                </span>
                                <img
                                    src={p.image || "https://picsum.photos/300/200?random=" + p.id}
                                    alt={p.name}
                                    className="product-card-img"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300&auto=format&fit=crop";
                                    }}
                                />
                            </div>
                            <div className="product-card-body">
                                <h3 className="product-card-title">{p.name}</h3>
                                <div style={{ marginBottom: "12px" }}>
                                    {renderStockBadge(p.quantity)}
                                </div>
                                <div className="product-card-info">
                                    <span className="product-card-price">
                                        {formatPrice(p.price)}
                                    </span>
                                    <span className="product-card-qty">
                                        SL: {p.quantity}
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="product-card-actions">
                                        <Link
                                            to={`/products/edit/${p.id}`}
                                            className="btn btn-secondary"
                                            title="Chỉnh sửa sản phẩm"
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
                                            Sửa
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="btn btn-danger"
                                            style={{
                                                padding: "8px",
                                                display: "inline-flex",
                                                justifyContent: "center",
                                            }}
                                            title="Xóa sản phẩm"
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
                                            Xóa
                                        </button>
                                    </div>
                                )}
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
                                <th>Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá bán</th>
                                <th>Trạng thái</th>
                                {isAdmin && <th style={{ textAlign: "right" }}>Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <img
                                            src={p.image || "https://picsum.photos/100?random=" + p.id}
                                            width={56}
                                            height={56}
                                            alt={p.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100&auto=format&fit=crop";
                                            }}
                                        />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td>
                                        <span className="badge badge-primary">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                                        {formatPrice(p.price)}
                                    </td>
                                    <td>{renderStockBadge(p.quantity)}</td>
                                    {isAdmin && (
                                        <td style={{ textAlign: "right" }}>
                                            <div
                                                style={{
                                                    display: "inline-flex",
                                                    gap: "8px",
                                                }}
                                            >
                                                <Link
                                                    to={`/products/edit/${p.id}`}
                                                    className="btn btn-icon-only"
                                                    title="Sửa"
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
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="btn btn-icon-only"
                                                    style={{
                                                        color: "var(--danger)",
                                                    }}
                                                    title="Xóa"
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
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

export default Home;