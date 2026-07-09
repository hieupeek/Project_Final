import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addProduct } from "../services/productService";

const AddProduct = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [product, setProduct] = useState({
        name: "",
        category: "",
        price: "",
        quantity: "",
        image: "",
    });

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

        // Simple validation
        if (!product.name || !product.category || !product.price || !product.quantity) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addProduct({
                ...product,
                price: Number(product.price),
                quantity: Number(product.quantity),
            } as any);
            navigate("/products");
        } catch (error) {
            console.error("Failed to add product:", error);
            alert("An error occurred while adding the product.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Add New Product</h1>
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
                    <span>Image Preview</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="name">
                        Product Name *
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g. Coca Cola"
                        className="form-control"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="category">
                        Category *
                    </label>
                    <input
                        id="category"
                        name="category"
                        type="text"
                        placeholder="e.g. Drink, Snack, Food"
                        className="form-control"
                        value={product.category}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="price">
                            Price (VND) *
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            placeholder="e.g. 15000"
                            className="form-control"
                            value={product.price}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="quantity">
                            Quantity *
                        </label>
                        <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            placeholder="e.g. 50"
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
                        Image URL
                    </label>
                    <input
                        id="image"
                        name="image"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="form-control"
                        value={product.image}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-actions">
                    <Link to="/products" className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Adding..." : "Add Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;