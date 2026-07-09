import { Link } from "react-router-dom";

const Welcome = () => {
    return (
        <div className="welcome-container">
            <header className="hero-section">
                <h1 className="hero-title">
                    Chào Mừng Đến Với SuperMarket 🛒
                </h1>
                <p className="hero-subtitle">
                    Hệ thống quản lý sản phẩm thông minh, hiện đại và tối giản giúp bạn theo dõi hàng hóa, tồn kho và kinh doanh hiệu quả hơn.
                </p>
                <Link to="/products" className="btn btn-primary cta-btn">
                    Khám phá Sản phẩm
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginLeft: "4px" }}
                    >
                        <line x1="5" x2="19" y1="12" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </Link>
            </header>

            <section className="features-section">
                <h2>Tính năng nổi bật</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect width="7" height="9" x="3" y="3" rx="1" />
                                <rect width="7" height="5" x="14" y="3" rx="1" />
                                <rect width="7" height="9" x="14" y="12" rx="1" />
                                <rect width="7" height="5" x="3" y="16" rx="1" />
                            </svg>
                        </div>
                        <h3>Chế độ xem linh hoạt</h3>
                        <p>
                            Dễ dàng chuyển đổi giữa chế độ xem lưới trực quan (Grid) và bảng danh sách chi tiết (Table) để quản lý sản phẩm.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg
                                width="28"
                                height="28"
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
                        </div>
                        <h3>Bộ lọc thông minh</h3>
                        <p>
                            Tìm kiếm sản phẩm tức thì theo tên và lọc theo danh mục sản phẩm (Category) động một cách chính xác.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                            </svg>
                        </div>
                        <h3>Giao diện tối đa năng</h3>
                        <p>
                            Bảo vệ mắt của bạn với chế độ giao diện tối (Dark Mode) cao cấp và chuyển đổi mượt mà bằng một chạm.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Welcome;
