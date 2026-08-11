import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, updateProduct } from "../services/productService";
import { createOrder } from "../services/orderService";
import { getCustomers, updateCustomer, addCustomer } from "../services/customerService";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types/Product";
import type { OrderItem } from "../types/OrderItem";
import type { Customer } from "../types/Customer";

const Sales = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Customer loyalty state
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [usePoints, setUsePoints] = useState(false);
    const [agreeToEarnPoints, setAgreeToEarnPoints] = useState(false);
    const [pointsInput, setPointsInput] = useState<string>("");

    // Quick add customer modal state
    const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
    const [newCustName, setNewCustName] = useState("");
    const [newCustPhone, setNewCustPhone] = useState("");
    const [newCustEmail, setNewCustEmail] = useState("");
    const [custSubmitting, setCustSubmitting] = useState(false);

    const fetchCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productData, customerData] = await Promise.all([
                    getProducts(),
                    getCustomers()
                ]);
                setProducts(productData);
                setCustomers(customerData);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product: Product) => {
        const costPrice = product.costPrice ?? Math.round(product.price * 0.5);
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

    const getStockForCartItem = (productId: number | string) => {
        const product = products.find((p) => p.id === productId);
        return product ? product.quantity : 0;
    };

    const updateQuantity = (productId: number | string, delta: number) => {
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

    const removeFromCart = (productId: number | string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCostAmount = cart.reduce((sum, item) => sum + (item.costSubtotal || 0), 0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    // Loyalty points calculation
    let pointsUsed = 0;
    let pointsError = "";

    if (usePoints && selectedCustomer) {
        const parsedPoints = parseInt(pointsInput, 10);
        if (pointsInput === "") {
            pointsError = "Vui lòng nhập số điểm muốn đổi";
        } else if (isNaN(parsedPoints) || parsedPoints <= 0) {
            pointsError = "Số điểm nhập phải là số nguyên dương lớn hơn 0";
        } else if (parsedPoints > selectedCustomer.points) {
            pointsError = `Số điểm nhập không được vượt quá số điểm khách hàng đang có (${selectedCustomer.points})`;
        } else if (parsedPoints * 1000 < 1000) {
            pointsError = "Số điểm quy đổi không được dưới 1,000đ (tối thiểu 1 điểm)";
        } else if (parsedPoints * 1000 > totalAmount) {
            pointsError = `Số điểm quy đổi không được vượt quá tổng giá trị đơn hàng (${formatPrice(totalAmount)})`;
        } else {
            pointsUsed = parsedPoints;
        }
    }

    const discountAmount = pointsUsed * 1000;
    const payableAmount = totalAmount - discountAmount;
    const pointsEarned = agreeToEarnPoints && selectedCustomer ? Math.floor(payableAmount / 10000) : 0;
    const totalProfitAmount = payableAmount - totalCostAmount;

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(customer.phone);
        if (usePoints) {
            setPointsInput(String(Math.min(customer.points, Math.floor(totalAmount / 1000))));
        }
    };

    const handleQuickAddCustomer = async (e: FormEvent) => {
        e.preventDefault();
        if (!newCustName || !newCustPhone) {
            alert("Vui lòng nhập Tên và Số điện thoại!");
            return;
        }

        const phoneExists = customers.some((c) => c.phone === newCustPhone);
        if (phoneExists) {
            alert("Số điện thoại này đã được đăng ký!");
            return;
        }

        setCustSubmitting(true);
        try {
            const newCust: Customer = {
                id: "CUST-" + Date.now(),
                name: newCustName,
                phone: newCustPhone,
                email: newCustEmail || undefined,
                points: 0,
                createdAt: new Date().toISOString(),
            };
            const created = await addCustomer(newCust);
            await fetchCustomers();
            handleSelectCustomer(created);
            setIsNewCustModalOpen(false);
            setNewCustName("");
            setNewCustPhone("");
            setNewCustEmail("");
        } catch (error) {
            console.error("Lỗi khi thêm nhanh khách hàng:", error);
            alert("Không thể tạo tài khoản khách hàng.");
        } finally {
            setCustSubmitting(false);
        }
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
                total: payableAmount,
                totalCost: totalCostAmount,
                totalProfit: totalProfitAmount,
                createdAt: new Date().toISOString(),
                employeeId: String(user.id) || "unknown",
                employeeName: user.name || "Nhân viên",
                ...((agreeToEarnPoints || usePoints) && selectedCustomer ? {
                    customerId: selectedCustomer.id,
                    customerName: selectedCustomer.name,
                    pointsEarned: pointsEarned,
                    pointsUsed: pointsUsed,
                    discountAmount: discountAmount
                } : {})
            };

            // 2. Lưu vào database bảng orders
            const savedOrder = await createOrder(newOrder);

            // 2.5 Cập nhật điểm tích luỹ khách hàng
            if ((agreeToEarnPoints || usePoints) && selectedCustomer) {
                const newPoints = selectedCustomer.points - pointsUsed + pointsEarned;
                await updateCustomer(selectedCustomer.id, {
                    ...selectedCustomer,
                    points: newPoints
                });
            }

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

                            {/* Hai tùy chọn tích điểm và đổi điểm độc lập */}
                            <div style={{
                                padding: "12px 16px",
                                borderTop: "1px solid var(--border-color, rgba(0,0,0,0.1))",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px"
                            }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13.5px", margin: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={agreeToEarnPoints}
                                        onChange={(e) => {
                                            setAgreeToEarnPoints(e.target.checked);
                                            if (!e.target.checked && !usePoints) {
                                                setSelectedCustomer(null);
                                                setCustomerSearch("");
                                                setPointsInput("");
                                            }
                                        }}
                                    />
                                    Khách hàng muốn tích điểm?
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13.5px", margin: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={usePoints}
                                        onChange={(e) => {
                                            setUsePoints(e.target.checked);
                                            if (e.target.checked) {
                                                if (selectedCustomer) {
                                                    setPointsInput(String(Math.min(selectedCustomer.points, Math.floor(totalAmount / 1000))));
                                                }
                                            } else {
                                                setPointsInput("");
                                                if (!agreeToEarnPoints) {
                                                    setSelectedCustomer(null);
                                                    setCustomerSearch("");
                                                }
                                            }
                                        }}
                                    />
                                    Khách hàng muốn đổi điểm?
                                </label>
                            </div>

                            {/* Phần khách hàng thân thiết */}
                            {(agreeToEarnPoints || usePoints) && (
                                <div className="sales-customer-section" style={{
                                    padding: "16px",
                                    borderTop: "1px solid var(--border-color, rgba(0,0,0,0.1))",
                                    backgroundColor: "var(--bg-card-muted, rgba(0,0,0,0.02))",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                                            👤 Khách hàng thân thiết
                                        </h3>
                                        {selectedCustomer ? (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: "2px 8px", fontSize: "12px", height: "auto" }}
                                                onClick={() => {
                                                    setSelectedCustomer(null);
                                                    setCustomerSearch("");
                                                    setUsePoints(false);
                                                    setPointsInput("");
                                                }}
                                            >
                                                Bỏ chọn
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: "4px 10px", fontSize: "12px", height: "auto", borderRadius: "14px" }}
                                                onClick={() => setIsNewCustModalOpen(true)}
                                            >
                                                + Thêm nhanh
                                            </button>
                                        )}
                                    </div>

                                    {!selectedCustomer ? (
                                        <div style={{ position: "relative" }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Tìm theo Tên hoặc Số điện thoại..."
                                                value={customerSearch}
                                                onChange={(e) => {
                                                    setCustomerSearch(e.target.value);
                                                    const found = customers.find(
                                                        (c) => c.phone === e.target.value || c.name.toLowerCase() === e.target.value.toLowerCase()
                                                    );
                                                    if (found) {
                                                        handleSelectCustomer(found);
                                                    }
                                                }}
                                                style={{ fontSize: "13px" }}
                                            />
                                            {customerSearch && !selectedCustomer && (
                                                <div style={{
                                                    position: "absolute",
                                                    bottom: "100%",
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: "var(--bg-card, #fff)",
                                                    border: "1px solid var(--border-color, rgba(0,0,0,0.15))",
                                                    borderRadius: "8px",
                                                    maxHeight: "150px",
                                                    overflowY: "auto",
                                                    zIndex: 100,
                                                    boxShadow: "0 -4px 12px rgba(0,0,0,0.15)"
                                                }}>
                                                    {customers
                                                        .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
                                                        .map(c => (
                                                            <div
                                                                key={c.id}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    cursor: "pointer",
                                                                    fontSize: "13px",
                                                                    borderBottom: "1px solid var(--border-color, rgba(0,0,0,0.05))",
                                                                    transition: "background 0.2s"
                                                                }}
                                                                onClick={() => {
                                                                    handleSelectCustomer(c);
                                                                }}
                                                            >
                                                                <strong>{c.name}</strong> - {c.phone} (Điểm: {c.points})
                                                            </div>
                                                        ))
                                                    }
                                                    {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).length === 0 && (
                                                        <div style={{ padding: "8px 12px", fontSize: "13px", color: "var(--text-muted)" }}>
                                                            Không tìm thấy khách hàng.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            backgroundColor: "var(--primary-light, rgba(37, 99, 235, 0.05))",
                                            border: "1px solid var(--primary, rgba(37, 99, 235, 0.2))",
                                            fontSize: "13px"
                                        }}>
                                            <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                                                {selectedCustomer.name} - {selectedCustomer.phone}
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <div>Điểm hiện có: <strong style={{ color: "#d97706" }}>{selectedCustomer.points}</strong></div>
                                                {agreeToEarnPoints && (
                                                    <div>Tích lũy mới: <strong style={{ color: "#10b981" }}>+{pointsEarned}</strong></div>
                                                )}
                                            </div>
                                            {usePoints && (
                                                <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border-color, rgba(0,0,0,0.1))" }}>
                                                    {selectedCustomer.points <= 0 ? (
                                                        <div style={{ color: "#ef4444", fontSize: "12px", fontWeight: "600" }}>
                                                            ⚠️ Khách hàng hiện không có điểm để quy đổi.
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <span style={{ fontSize: "13px", fontWeight: "600" }}>Số điểm muốn đổi:</span>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    style={{ width: "90px", padding: "4px 8px", fontSize: "13px", height: "auto" }}
                                                                    value={pointsInput}
                                                                    min="1"
                                                                    max={selectedCustomer.points}
                                                                    onChange={(e) => setPointsInput(e.target.value)}
                                                                />
                                                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                                                                    (Quy đổi: -{formatPrice(discountAmount)})
                                                                </span>
                                                            </div>
                                                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                                Tỷ lệ: 1 điểm = 1,000đ. Tối đa có thể đổi {Math.min(selectedCustomer.points, Math.floor(totalAmount / 1000))} điểm.
                                                            </span>
                                                            {pointsError && (
                                                                <div style={{ color: "#ef4444", fontSize: "12px", fontWeight: "600", marginTop: "2px" }}>
                                                                    ⚠️ {pointsError}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="sales-cart-footer">
                                {discountAmount > 0 && (
                                    <>
                                        <div className="cart-total" style={{ fontSize: "14px", paddingBottom: "4px", color: "var(--text-muted)" }}>
                                            <span>Tạm tính</span>
                                            <span>{formatPrice(totalAmount)}</span>
                                        </div>
                                        <div className="cart-total" style={{ fontSize: "14px", paddingBottom: "4px", color: "#ef4444" }}>
                                            <span>Giảm giá điểm tích lũy</span>
                                            <span>-{formatPrice(discountAmount)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="cart-total">
                                    <span>{discountAmount > 0 ? "Thực trả" : "Tổng cộng"}</span>
                                    <span className="cart-total-amount">{formatPrice(payableAmount)}</span>
                                </div>
                                <button
                                    className="btn btn-success sales-print-btn"
                                    onClick={handlePrintInvoice}
                                    disabled={submitting || (usePoints && !!pointsError)}
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

            {/* QUICK ADD CUSTOMER MODAL */}
            {isNewCustModalOpen && (
                <div className="modal-overlay" onClick={() => setIsNewCustModalOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsNewCustModalOpen(false)} aria-label="Đóng">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" x2="6" y1="6" y2="18" />
                                <line x1="6" x2="18" y1="6" y2="18" />
                            </svg>
                        </button>
                        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px" }}>Đăng ký khách hàng thân thiết</h2>
                        <form onSubmit={handleQuickAddCustomer}>
                            <div className="form-group">
                                <label className="form-label">Tên khách hàng *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newCustName}
                                    onChange={(e) => setNewCustName(e.target.value)}
                                    placeholder="Nhập họ và tên..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số điện thoại *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newCustPhone}
                                    onChange={(e) => setNewCustPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email (Tùy chọn)</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={newCustEmail}
                                    onChange={(e) => setNewCustEmail(e.target.value)}
                                    placeholder="Nhập địa chỉ email..."
                                />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsNewCustModalOpen(false)} disabled={custSubmitting}>Huỷ</button>
                                <button type="submit" className="btn btn-primary" disabled={custSubmitting}>{custSubmitting ? "Đang lưu..." : "Đăng ký"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
