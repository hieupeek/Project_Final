import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="navbar">
            <h2>SuperMarket</h2>

            <div>
                <Link to="/">Home</Link>

                <Link to="/add">
                    Add Product
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;