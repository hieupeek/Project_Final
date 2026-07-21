import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, updateProduct } from "../services/productService";
import { createOrder } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types/Product";
import type { OrderItem } from "../types/OrderItem";

const Sales = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product: Product) => {
        const costPrice = product.costPrice ?? Math.round(product.price * 0.65);
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.quantity) return prev;
                const newQty = existing.quantity + 1;
                const subtotal = product.price * newQty;
                const costSubtotal = costPrice * newQty;
                return prev.map((item) =>
                    item.productId === product.id
                        ? {
                              ...item,
                              quantity: newQty,
                              subtotal,
                              costSubtotal,
                              profit: subtotal - costSubtotal,
                          }
                        : item
                );
            }
            if (product.quantity <= 0) return prev;
            const subtotal = product.price;
            const costSubtotal = costPrice;
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    costPrice,
                    quantity: 1,
                    subtotal,
                    costSubtotal,
                    profit: subtotal - costSubtotal,
                },
            ];
        });
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.productId !== productId) return item;
                    const product = products.find((p) => p.id === productId);
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return null;
                    if (product && newQty > product.quantity) return item;
                    const costPrice = item.costPrice ?? (product?.costPrice ?? Math.round(item.price * 0.65));
                    const subtotal = item.price * newQty;
                    const costSubtotal = costPrice * newQty;
                    return {
                        ...item,
                        quantity: newQty,
                        subtotal,
                        costSubtotal,
                        profit: subtotal - costSubtotal,
                    };
                })
                .filter(Boolean) as OrderItem[];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCostAmount = cart.reduce((sum, item) => sum + (item.costSubtotal || 0), 0);
    const totalProfitAmount = totalAmount - totalCostAmount;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    const handlePrintInvoice = async () => {
        if (cart.length === 0) return;
        if (!user) {
            alert("Vui lòng đăng nhập để thực hiện giao dịch.");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Tạo đối tượng Order
            const newOrder = {
                items: cart,
                total: totalAmount,
                totalCost: totalCostAmount,
                totalProfit: totalProfitAmount,
                createdAt: new Date().toISOString(),
                employeeId: String(user.id) || "unknown",
                employeeName: user.name || "Nhân viên",
            };

            // 2. Lưu vào database bảng orders
            const savedOrder = await createOrder(newOrder);

            // 3. Cập nhật tồn kho sản phẩm trong database
            await Promise.all(
                cart.map(async (item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (product) {
                        const updatedProduct = {
                            ...product,
                            quantity: product.quantity - item.quantity,
                        };
                        await updateProduct(product.id, updatedProduct);
                    }
                })
            );

            // 4. Chuyển sang trang hóa đơn với dữ liệu đã lưu
            navigate("/invoice", { state: { order: savedOrder } });
        } catch (error) {
            console.error("Lỗi khi xử lý thanh toán:", error);
            alert("Có lỗi xảy ra khi tạo hóa đơn và cập nhật kho hàng. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStockForCartItem = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        return product ? product.quantity : 0;
    };

    return (
        <div className="container sales-container">
            <h1>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Bán Hàng
            </h1>

            <div className="sales-layout">
                {/* Product List Panel */}
                <div className="sales-products-panel">
                    <div className="sales-panel-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2H2v10h10V2Z" />
                                <path d="M22 2h-10v10h10V2Z" />
                                <path d="M12 12H2v10h10V12Z" />
                                <path d="M22 12h-10v10h10V12Z" />
                            </svg>
                            Danh sách sản phẩm
                        </h2>
                        <div className="sales-search-wrapper">
                            <svg className="sales-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <input
                                type="text"
                                className="form-control sales-search-input"
                                placeholder="Tìm sản phẩm..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="sales-loading">
                            <div className="sales-spinner" />
                            <p>Đang tải sản phẩm...</p>
                        </div>
                    ) : (
                        <div className="sales-product-grid">
                            {filteredProducts.map((product) => {
                                const inCart = cart.find((item) => item.productId === product.id);
                                const isOutOfStock = product.quantity <= 0;
                                const isMaxReached = inCart ? inCart.quantity >= product.quantity : false;

                                return (
                                    <div
                                        key={product.id}
                                        className={`sales-product-item ${isOutOfStock ? "out-of-stock" : ""}`}
                                    >
                                        <div className="sales-product-info">
                                            <span className="sales-product-name">{product.name}</span>
                                            <span className="sales-product-category">{product.category}</span>
                                            <div className="sales-product-meta">
                                                <span className="sales-product-price">{formatPrice(product.price)}</span>
                                                <span className={`sales-product-stock ${product.quantity <= 10 ? (product.quantity === 0 ? "stock-out" : "stock-low") : "stock-ok"}`}>
                                                    Kho: {product.quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary sales-add-btn"
                                            onClick={() => addToCart(product)}
                                            disabled={isOutOfStock || isMaxReached}
                                            title={isOutOfStock ? "Hết hàng" : isMaxReached ? "Đã đạt tối đa kho" : "Thêm vào giỏ"}
                                        >
                                            {inCart ? (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 6 9 17l-5-5" />
                                                    </svg>
                                                    {inCart.quantity}
                                                </>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12h14" />
                                                    <path d="M12 5v14" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <div className="sales-empty">
                                    <p>Không tìm thấy sản phẩm nào.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Cart Panel */}
                <div className="sales-cart-panel">
                    <div className="sales-panel-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            Giỏ hàng
                            {cart.length > 0 && (
                                <span className="cart-count">{cart.length}</span>
                            )}
                        </h2>
                    </div>

                    {cart.length === 0 ? (
                        <div className="sales-cart-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            <p>Chưa có sản phẩm nào</p>
                            <span>Chọn sản phẩm từ danh sách bên trái</span>
                        </div>
                    ) : (
                        <div className="sales-cart-content">
                            <div className="sales-cart-items">
                                {cart.map((item) => (
                                    <div key={item.productId} className="sales-cart-item">
                                        <div className="cart-item-info">
                                            <span className="cart-item-name">{item.name}</span>
                                            <span className="cart-item-price">{formatPrice(item.price)}</span>
                                        </div>
                                        <div className="cart-item-actions">
                                            <div className="cart-qty-controls">
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateQuantity(item.productId, -1)}
                                                    title="Giảm"
                                                >
                                                    −
                                                </button>
                                                <span className="cart-qty-value">{item.quantity}</span>
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateQuantity(item.productId, 1)}
                                                    disabled={item.quantity >= getStockForCartItem(item.productId)}
                                                    title="Tăng"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="cart-item-subtotal">{formatPrice(item.subtotal)}</span>
                                            <button
                                                className="cart-remove-btn"
                                                onClick={() => removeFromCart(item.productId)}
                                                title="Xoá"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="sales-cart-footer">
                                <div className="cart-total">
                                    <span>Tổng cộng</span>
                                    <span className="cart-total-amount">{formatPrice(totalAmount)}</span>
                                </div>
                                <button
                                    className="btn btn-success sales-print-btn"
                                    onClick={handlePrintInvoice}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="sales-spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8, display: "inline-block" }} />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 6 2 18 2 18 9" />
                                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                                <rect width="12" height="8" x="6" y="14" />
                                            </svg>
                                            In Hoá Đơn
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sales;
