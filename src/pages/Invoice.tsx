import { useLocation, useNavigate } from "react-router-dom";
import type { OrderItem } from "../types/OrderItem";

interface InvoiceState {
    items: OrderItem[];
    total: number;
}

const Invoice = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as InvoiceState | null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    const now = new Date();
    const formattedDate = now.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const formattedTime = now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    if (!state || !state.items || state.items.length === 0) {
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
                    <div className="invoice-meta">
                        <span>Ngày: {formattedDate}</span>
                        <span>Giờ: {formattedTime}</span>
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
                        {state.items.map((item, index) => (
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
                        <tr className="invoice-total-row">
                            <td colSpan={3} />
                            <td className="text-center"><strong>Tổng</strong></td>
                            <td className="text-right">
                                <strong>{formatPrice(state.total)}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div className="invoice-footer">
                    <div className="invoice-divider" />
                    <p className="invoice-thanks">Cảm ơn quý khách đã mua hàng!</p>
                    <p className="invoice-note">Hàng đã mua vui lòng kiểm tra trước khi rời quầy.</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
