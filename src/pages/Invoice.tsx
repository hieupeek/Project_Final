import { useLocation, useNavigate } from "react-router-dom";
import type { Order } from "../types/Order";

interface InvoiceState {
    order: Order;
}

const Invoice = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as InvoiceState | null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    if (!state || !state.order) {
        return (
            <div className="container">
                <div className="invoice-empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                        <path d="M10 9H8" />
                    </svg>
                    <h2>Không có hoá đơn</h2>
                    <p>Vui lòng tạo đơn hàng từ trang Bán hàng trước.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/sales")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        Quay lại Bán hàng
                    </button>
                </div>
            </div>
        );
    }

    const { order } = state;
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const formattedTime = orderDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container invoice-container">
            {/* Action buttons — hidden on print */}
            <div className="invoice-actions no-print">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/sales")}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 19-7-7 7-7" />
                        <path d="M19 12H5" />
                    </svg>
                    Quay lại Bán hàng
                </button>
                <button className="btn btn-primary" onClick={handlePrint}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect width="12" height="8" x="6" y="14" />
                    </svg>
                    In Hoá Đơn
                </button>
            </div>

            {/* Invoice Content */}
            <div className="invoice-page">
                <div className="invoice-header">
                    <div className="invoice-brand">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <h1>SUPERMARKET</h1>
                    </div>
                    <p className="invoice-address">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                    <p className="invoice-phone">Hotline: 0123 456 789</p>
                    <div className="invoice-divider" />
                    <h2 className="invoice-title">HOÁ ĐƠN BÁN HÀNG</h2>
                    <div className="invoice-meta" style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                        <div style={{ fontWeight: 600, color: "#333" }}>Mã HĐ: #{order.id}</div>
                        <div className="invoice-meta-row" style={{ display: "flex", gap: "24px", fontSize: "0.85rem", color: "#666" }}>
                            <span>Ngày: {formattedDate}</span>
                            <span>Giờ: {formattedTime}</span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#666" }}>Nhân viên: {order.employeeName}</div>
                        {order.customerName && (
                            <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: "600" }}>Khách hàng: {order.customerName}</div>
                        )}
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Sản phẩm</th>
                            <th className="text-right">Đơn giá</th>
                            <th className="text-center">SL</th>
                            <th className="text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, index) => (
                            <tr key={item.productId}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td className="text-right">{formatPrice(item.price)}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-right">{formatPrice(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {order.discountAmount && order.discountAmount > 0 ? (
                            <>
                                <tr>
                                    <td colSpan={3} />
                                    <td className="text-center" style={{ fontSize: "0.9rem", color: "#666" }}>Cộng tiền hàng</td>
                                    <td className="text-right" style={{ fontSize: "0.9rem", color: "#666" }}>
                                        {formatPrice(order.total + order.discountAmount)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={3} />
                                    <td className="text-center" style={{ fontSize: "0.9rem", color: "#ef4444" }}>Giảm giá điểm</td>
                                    <td className="text-right" style={{ fontSize: "0.9rem", color: "#ef4444" }}>
                                        -{formatPrice(order.discountAmount)}
                                    </td>
                                </tr>
                            </>
                        ) : null}
                        <tr className="invoice-total-row">
                            <td colSpan={3} />
                            <td className="text-center"><strong>Thực trả</strong></td>
                            <td className="text-right">
                                <strong>{formatPrice(order.total)}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className="invoice-footer">
                    {order.customerId && (
                        <div className="no-print" style={{
                            margin: "10px auto 15px auto",
                            padding: "10px 14px",
                            border: "1px dashed #d97706",
                            borderRadius: "6px",
                            backgroundColor: "rgba(217, 119, 6, 0.03)",
                            fontSize: "0.85rem",
                            maxWidth: "320px",
                            textAlign: "left"
                        }}>
                            <div style={{ fontWeight: "700", color: "#d97706", marginBottom: "6px", textAlign: "center" }}>
                                ✨ THÔNG TIN TÍCH ĐIỂM
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span>Điểm tích lũy từ đơn:</span>
                                <strong style={{ color: "#10b981" }}>+{order.pointsEarned || 0}</strong>
                            </div>
                            {order.pointsUsed && order.pointsUsed > 0 ? (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Điểm sử dụng giảm giá:</span>
                                    <strong style={{ color: "#ef4444" }}>-{order.pointsUsed}</strong>
                                </div>
                            ) : null}
                        </div>
                    )}
                    {/* Bản in cũng sẽ hiển thị thông tin tích điểm gọn gàng hơn */}
                    {order.customerId && (
                        <div className="print-only" style={{
                            fontSize: "0.8rem",
                            margin: "8px 0",
                            textAlign: "left",
                            borderTop: "1px dashed #ccc",
                            paddingTop: "6px"
                        }}>
                            <div>Điểm tích luỹ từ đơn này: +{order.pointsEarned || 0}</div>
                            {order.pointsUsed && order.pointsUsed > 0 ? (
                                <div>Điểm đã sử dụng: -{order.pointsUsed}</div>
                            ) : null}
                        </div>
                    )}
                    <div className="invoice-divider" />
                    <p className="invoice-thanks">Cảm ơn quý khách đã mua hàng!</p>
                    <p className="invoice-note">Hàng đã mua vui lòng kiểm tra trước khi rời quầy.</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
