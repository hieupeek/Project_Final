import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/Product";
import {
    deleteProduct,
    getProducts,
} from "../services/productService";

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);

    const loadData = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this product?")) return;

        await deleteProduct(id);

        loadData();
    };

    return (
        <>
            <h1>Product List</h1>

            <table>
                <thead>
                    <tr>
                        <th>Image</th>

                        <th>Name</th>

                        <th>Category</th>

                        <th>Price</th>

                        <th>Qty</th>

                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>
                                <img
                                    src={p.image}
                                    width={70}
                                />
                            </td>

                            <td>{p.name}</td>

                            <td>{p.category}</td>

                            <td>${p.price}</td>

                            <td>{p.quantity}</td>

                            <td>
                                <Link to={`/edit/${p.id}`}>
                                    Edit
                                </Link>

                                {" | "}

                                <button
                                    onClick={() =>
                                        handleDelete(
                                            p.id
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default Home;