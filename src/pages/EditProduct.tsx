import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    getProduct,
    updateProduct,
} from "../services/productService";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [product, setProduct] = useState<any>({
        name: "",
        category: "",
        price: "",
        quantity: "",
        image: "",
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getProduct(Number(id));
                setProduct({
                    name: data.name || "",
                    category: data.category || "",
                    price: data.price !== undefined ? String(data.price) : "",
                    quantity: data.quantity !== undefined ? String(data.quantity) : "",
                    image: data.image || "",
                });
            } catch (error) {
                console.error("Failed to load product data:", error);
                alert("Không thể tải thông tin sản phẩm.");
                navigate("/products");
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [id, navigate]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!product.name || !product.category || !product.price || !product.quantity) {
            alert("Vui lòng nhập đầy đủ các trường bắt buộc.");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProduct(Number(id), {
                ...product,
                price: Number(product.price),
                quantity: Number(product.quantity),
            });
            navigate("/products");
        } catch (error) {
            console.error("Failed to update product:", error);
            alert("Có lỗi xảy ra khi cập nhật sản phẩm.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <div
                    style={{
                        display: "inline-block",
                        width: "40px",
                        height: "40px",
                        border: "4px solid var(--primary-light)",
                        borderTopColor: "var(--primary)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }}
                />
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
                <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>
                    Đang tải chi tiết sản phẩm...
                </p>
            </div>
        );
    }

    return (
        <div className="form-card card">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                }}
            >
                <Link to="/products" className="btn btn-icon-only" title="Go back to Products">
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
                        <line x1="19" x2="5" y1="12" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </Link>
                <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Chỉnh sửa sản phẩm</h1>
            </div>

            <div className="image-preview-wrapper">
                {product.image ? (
                    <img
                        src={product.image}
                        alt="Preview"
                        className="image-preview-img"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            const placeholder = document.getElementById("preview-placeholder");
                            if (placeholder) placeholder.style.display = "flex";
                        }}
                        onLoad={(e) => {
                            (e.target as HTMLImageElement).style.display = "block";
                            const placeholder = document.getElementById("preview-placeholder");
                            if (placeholder) placeholder.style.display = "none";
                        }}
                    />
                ) : null}
                <div
                    id="preview-placeholder"
                    className="image-preview-placeholder"
                    style={{ display: product.image ? "none" : "flex" }}
                >
                    <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span>Xem trước hình ảnh</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="name">
                        Tên sản phẩm *
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Name"
                        className="form-control"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="category">
                        Danh mục *
                    </label>
                    <input
                        id="category"
                        name="category"
                        type="text"
                        placeholder="Category"
                        className="form-control"
                        value={product.category}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="price">
                            Giá bán (VND) *
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            placeholder="Price"
                            className="form-control"
                            value={product.price}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="quantity">
                            Số lượng *
                        </label>
                        <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            placeholder="Quantity"
                            className="form-control"
                            value={product.quantity}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="image">
                        Đường dẫn hình ảnh (URL)
                    </label>
                    <input
                        id="image"
                        name="image"
                        type="url"
                        placeholder="Image URL"
                        className="form-control"
                        value={product.image}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-actions">
                    <Link to="/products" className="btn btn-secondary">
                        Hủy
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;