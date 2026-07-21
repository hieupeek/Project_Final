import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, deleteOrder } from "../services/orderService";
import type { Order } from "../types/Order";
import type { OrderItem } from "../types/OrderItem";

interface ProductSaleStat {
    productId: number;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
}

export default function SalesHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "today" | "7days" | "month">("all");
    const [activeTab, setActiveTab] = useState<"history" | "analytics">("history");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrderData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrders();
            setOrders(data.reverse()); // Mới nhất lên đầu
        } catch (err: unknown) {
            console.error("Lỗi khi tải lịch sử đơn hàng:", err);
            setError("Không thể tải lịch sử bán hàng. Vui lòng kiểm tra json-server!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderData();
    }, []);

    const handleDeleteOrder = async (id: string) => {
        if (!confirm(`Bạn có chắc muốn xóa hóa đơn ${id}?`)) return;
        try {
            await deleteOrder(id);
            setOrders((prev) => prev.filter((o) => o.id !== id));
            if (selectedOrder?.id === id) setSelectedOrder(null);
        } catch {
            alert("Không thể xóa đơn hàng này.");
        }
    };

    // Lọc theo thời gian
    const filteredByTimeOrders = orders.filter((order) => {
        if (timeFilter === "all") return true;
        const orderDate = new Date(order.createdAt);
        const now = new Date();

        if (timeFilter === "today") {
            return (
                orderDate.getDate() === now.getDate() &&
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            );
        }

        if (timeFilter === "7days") {
            const diffTime = Math.abs(now.getTime() - orderDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }

        if (timeFilter === "month") {
            return (
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            );
        }

        return true;
    });

    // Lọc theo từ khóa tìm kiếm (Mã đơn hoặc Tên nhân viên)
    const filteredOrders = filteredByTimeOrders.filter((o) => {
        const query = searchQuery.toLowerCase();
        return (
            (o.id && o.id.toLowerCase().includes(query)) ||
            (o.employeeName && o.employeeName.toLowerCase().includes(query))
        );
    });

    // Tính toán số liệu thống kê tổng quan
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);

    const totalCost = filteredOrders.reduce((sum, o) => {
        if (o.totalCost !== undefined) return sum + o.totalCost;
        // Nếu hóa đơn cũ chưa có totalCost, tính ước lượng 65%
        const estCost = o.items.reduce((itemSum, item) => {
            const cPrice = item.costPrice ?? Math.round(item.price * 0.65);
            return itemSum + cPrice * item.quantity;
        }, 0);
        return sum + estCost;
    }, 0);

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

    const totalItemsSold = filteredOrders.reduce((sum, o) => {
        return sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0);
    }, 0);

    // Bảng tổng hợp thống kê mặt hàng bán chạy & lợi nhuận từng món
    const productStatsMap: Record<number, ProductSaleStat> = {};

    filteredOrders.forEach((order) => {
        order.items.forEach((item) => {
            const cPrice = item.costPrice ?? Math.round(item.price * 0.65);
            const itemCost = item.costSubtotal ?? cPrice * item.quantity;
            const itemProfit = item.profit ?? item.subtotal - itemCost;

            if (!productStatsMap[item.productId]) {
                productStatsMap[item.productId] = {
                    productId: item.productId,
                    name: item.name,
                    totalQuantity: 0,
                    totalRevenue: 0,
                    totalCost: 0,
                    totalProfit: 0,
                };
            }

            productStatsMap[item.productId].totalQuantity += item.quantity;
            productStatsMap[item.productId].totalRevenue += item.subtotal;
            productStatsMap[item.productId].totalCost += itemCost;
            productStatsMap[item.productId].totalProfit += itemProfit;
        });
    });

    const productStatsList = Object.values(productStatsMap).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
    );

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="container" style={{ paddingBottom: "40px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                        📊 Lịch Sử Bán Hàng & Thống Kê Lãi Vốn
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>
                        Theo dõi doanh thu, tổng vốn nhập hàng, lợi nhuận gộp và top mặt hàng bán chạy.
                    </p>
                </div>
                <Link to="/sales" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    🛒 Trang Bán Hàng POS
                </Link>
            </div>

            {/* Loading & Error */}
            {loading && (
                <div style={{ textAlign: "center", padding: "40px", fontSize: "16px", color: "var(--text-muted)" }}>
                    ⚡ Đang tải dữ liệu lịch sử bán hàng...
                </div>
            )}

            {error && (
                <div style={{ backgroundColor: "#451a1a", border: "1px solid #991b1b", color: "#fca5a5", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px" }}>
                    ⚠️ {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* KPI Stat Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                        {/* Doanh thu */}
                        <div style={kpiCardStyle}>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>💵 TỔNG DOANH THU</div>
                            <div style={{ fontSize: "22px", fontWeight: "800", color: "#3b82f6", marginTop: "4px" }}>
                                {formatVND(totalRevenue)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{filteredOrders.length} hóa đơn</div>
                        </div>

                        {/* Tổng vốn */}
                        <div style={kpiCardStyle}>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>🏭 TỔNG GIÁ VỐN</div>
                            <div style={{ fontSize: "22px", fontWeight: "800", color: "#f59e0b", marginTop: "4px" }}>
                                {formatVND(totalCost)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Chi phí vốn nhập</div>
                        </div>

                        {/* Lợi nhuận gộp */}
                        <div style={{ ...kpiCardStyle, borderLeft: "4px solid #10b981" }}>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>📈 LỢI NHUẬN GỘP</div>
                            <div style={{ fontSize: "22px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
                                {formatVND(totalProfit)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", marginTop: "4px" }}>
                                Tỷ suất lợi nhuận: {profitMargin}%
                            </div>
                        </div>

                        {/* Sản phẩm bán ra */}
                        <div style={kpiCardStyle}>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>📦 ĐÃ BÁN RA</div>
                            <div style={{ fontSize: "22px", fontWeight: "800", color: "#8b5cf6", marginTop: "4px" }}>
                                {totalItemsSold} món
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Sản phẩm xuất kho</div>
                        </div>
                    </div>

                    {/* Toolbar: Time Filter & Search & Tabs */}
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px", backgroundColor: "var(--bg-card)", padding: "14px 18px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                        {/* Tabs */}
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={() => setActiveTab("history")}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    backgroundColor: activeTab === "history" ? "var(--primary)" : "transparent",
                                    color: activeTab === "history" ? "#ffffff" : "var(--text-main)",
                                }}
                            >
                                📜 Lịch Sử Hóa Đơn ({filteredOrders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("analytics")}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "none",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    backgroundColor: activeTab === "analytics" ? "var(--primary)" : "transparent",
                                    color: activeTab === "analytics" ? "#ffffff" : "var(--text-main)",
                                }}
                            >
                                📊 Bán Những Gì & Lãi Món
                            </button>
                        </div>

                        {/* Time Filter Tabs */}
                        <div style={{ display: "flex", gap: "6px" }}>
                            {(["all", "today", "7days", "month"] as const).map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeFilter(tf)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        border: "1px solid var(--border-color)",
                                        backgroundColor: timeFilter === tf ? "var(--primary-light)" : "transparent",
                                        color: timeFilter === tf ? "var(--primary)" : "var(--text-muted)",
                                        fontWeight: timeFilter === tf ? "700" : "500",
                                        cursor: "pointer",
                                    }}
                                >
                                    {tf === "all" && "Tất cả"}
                                    {tf === "today" && "Hôm nay"}
                                    {tf === "7days" && "7 ngày qua"}
                                    {tf === "month" && "Tháng này"}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div style={{ width: "240px" }}>
                            <input
                                type="text"
                                placeholder="Tìm theo mã đơn/nhân viên..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-control"
                                style={{ padding: "8px 12px", fontSize: "14px" }}
                            />
                        </div>
                    </div>

                    {/* TAB 1: LỊCH SỬ HÓA ĐƠN */}
                    {activeTab === "history" && (
                        <div>
                            {filteredOrders.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px", backgroundColor: "var(--bg-card)", borderRadius: "12px", color: "var(--text-muted)" }}>
                                    🚫 Không tìm thấy hóa đơn bán hàng nào phù hợp.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Mã Hóa Đơn</th>
                                                <th>Thời Gian</th>
                                                <th>Nhân Viên Lập</th>
                                                <th>Sản Phẩm Đã Bán</th>
                                                <th>Giá Vốn</th>
                                                <th>Doanh Thu</th>
                                                <th>Lợi Nhuận</th>
                                                <th style={{ textAlign: "right" }}>Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map((order) => {
                                                const orderCost = order.totalCost ?? order.items.reduce((s, i) => s + (i.costPrice ?? Math.round(i.price * 0.65)) * i.quantity, 0);
                                                const orderProfit = order.totalProfit ?? order.total - orderCost;

                                                return (
                                                    <tr key={order.id}>
                                                        <td style={{ fontWeight: "700", color: "var(--primary)" }}>
                                                            {order.id}
                                                        </td>
                                                        <td style={{ fontSize: "13px" }}>{formatDate(order.createdAt)}</td>
                                                        <td>
                                                            <span className="badge badge-secondary">{order.employeeName}</span>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: "13px", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                                                            </div>
                                                        </td>
                                                        <td style={{ color: "#f59e0b", fontWeight: "600" }}>
                                                            {formatVND(orderCost)}
                                                        </td>
                                                        <td style={{ fontWeight: "700" }}>{formatVND(order.total)}</td>
                                                        <td style={{ fontWeight: "700", color: "#10b981" }}>
                                                            +{formatVND(orderProfit)}
                                                        </td>
                                                        <td style={{ textAlign: "right" }}>
                                                            <div style={{ display: "inline-flex", gap: "6px" }}>
                                                                <button
                                                                    onClick={() => setSelectedOrder(order)}
                                                                    className="btn btn-secondary"
                                                                    style={{ padding: "5px 10px", fontSize: "12px" }}
                                                                >
                                                                    👁️ Chi tiết
                                                                </button>
                                                                <button
                                                                    onClick={() => order.id && handleDeleteOrder(order.id)}
                                                                    className="btn btn-danger"
                                                                    style={{ padding: "5px 10px", fontSize: "12px" }}
                                                                >
                                                                    🗑️ Xóa
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: THỐNG KÊ BÁN NHỮNG GÌ & LÃI TỪNG MÓN */}
                    {activeTab === "analytics" && (
                        <div>
                            {productStatsList.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px", backgroundColor: "var(--bg-card)", borderRadius: "12px", color: "var(--text-muted)" }}>
                                    🚫 Chưa có dữ liệu thống kê sản phẩm.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th># Top</th>
                                                <th>Mặt Hàng</th>
                                                <th>Số Lượng Đã Bán</th>
                                                <th>Tổng Giá Vốn</th>
                                                <th>Tổng Doanh Thu</th>
                                                <th>Lợi Nhuận Thu Về</th>
                                                <th>Tỷ Lệ Sinh Lời</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productStatsList.map((stat, idx) => {
                                                const margin = stat.totalRevenue > 0 ? ((stat.totalProfit / stat.totalRevenue) * 100).toFixed(1) : "0.0";
                                                return (
                                                    <tr key={stat.productId}>
                                                        <td style={{ fontWeight: "700", color: idx < 3 ? "#f59e0b" : "var(--text-muted)" }}>
                                                            {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                                                        </td>
                                                        <td style={{ fontWeight: "700" }}>{stat.name}</td>
                                                        <td>
                                                            <span className="badge badge-primary">{stat.totalQuantity} món</span>
                                                        </td>
                                                        <td style={{ color: "#f59e0b", fontWeight: "600" }}>
                                                            {formatVND(stat.totalCost)}
                                                        </td>
                                                        <td style={{ fontWeight: "700", color: "#3b82f6" }}>
                                                            {formatVND(stat.totalRevenue)}
                                                        </td>
                                                        <td style={{ fontWeight: "700", color: "#10b981" }}>
                                                            +{formatVND(stat.totalProfit)}
                                                        </td>
                                                        <td>
                                                            <span style={{ padding: "4px 8px", borderRadius: "12px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontWeight: "700", fontSize: "12px" }}>
                                                                {margin}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* MODAL CHI TIẾT HÓA ĐƠN */}
            {selectedOrder && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
                    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", maxWidth: "520px", width: "100%", padding: "24px", color: "var(--text-main)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.4)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>🧾 Chi Tiết Hóa Đơn {selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
                        </div>

                        <div style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                            <div><strong>Thời gian:</strong> {formatDate(selectedOrder.createdAt)}</div>
                            <div><strong>Nhân viên lập:</strong> {selectedOrder.employeeName}</div>
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Danh sách sản phẩm:</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {selectedOrder.items.map((item: OrderItem, i: number) => {
                                    const cPrice = item.costPrice ?? Math.round(item.price * 0.65);
                                    const cSubtotal = item.costSubtotal ?? cPrice * item.quantity;
                                    const pProfit = item.profit ?? item.subtotal - cSubtotal;

                                    return (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontSize: "13px" }}>
                                            <div>
                                                <div style={{ fontWeight: "600" }}>{item.name}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                    {formatVND(item.price)} x {item.quantity} (Vốn: {formatVND(cPrice)}/món)
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontWeight: "700" }}>{formatVND(item.subtotal)}</div>
                                                <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>Lãi: +{formatVND(pProfit)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "12px", fontSize: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Tổng Doanh Thu:</span>
                                <strong style={{ color: "#3b82f6" }}>{formatVND(selectedOrder.total)}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Tổng Giá Vốn:</span>
                                <strong style={{ color: "#f59e0b" }}>
                                    {formatVND(selectedOrder.totalCost ?? selectedOrder.items.reduce((s, i) => s + (i.costPrice ?? Math.round(i.price * 0.65)) * i.quantity, 0))}
                                </strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", paddingTop: "6px", borderTop: "1px solid var(--border-color)" }}>
                                <span>Lợi Nhuận Thu Về:</span>
                                <strong style={{ color: "#10b981" }}>
                                    +{formatVND(selectedOrder.totalProfit ?? (selectedOrder.total - (selectedOrder.totalCost ?? 0)))}
                                </strong>
                            </div>
                        </div>

                        <div style={{ marginTop: "20px", textAlign: "right" }}>
                            <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const kpiCardStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "var(--shadow-sm)",
};
