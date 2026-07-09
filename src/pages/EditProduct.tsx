import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getProduct,
    updateProduct,
} from "../services/productService";

const EditProduct = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const [product, setProduct] = useState<any>({});

    useEffect(() => {
        const load = async () => {
            const data = await getProduct(Number(id));

            setProduct(data);
        };

        load();
    }, []);

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

        await updateProduct(
            Number(id),
            product
        );

        navigate("/");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Edit Product</h1>

            <input
                name="name"
                value={product.name || ""}
                onChange={handleChange}
            />

            <input
                name="category"
                value={product.category || ""}
                onChange={handleChange}
            />

            <input
                name="price"
                type="number"
                value={product.price || ""}
                onChange={handleChange}
            />

            <input
                name="quantity"
                type="number"
                value={product.quantity || ""}
                onChange={handleChange}
            />

            <input
                name="image"
                value={product.image || ""}
                onChange={handleChange}
            />

            <button>Update</button>
        </form>
    );
};

export default EditProduct;