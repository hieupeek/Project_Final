import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/productService";

const AddProduct = () => {
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        name: "",
        category: "",
        price: 0,
        quantity: 0,
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

        await addProduct(product as any);

        navigate("/");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Add Product</h1>

            <input
                name="name"
                placeholder="Name"
                onChange={handleChange}
            />

            <input
                name="category"
                placeholder="Category"
                onChange={handleChange}
            />

            <input
                name="price"
                placeholder="Price"
                type="number"
                onChange={handleChange}
            />

            <input
                name="quantity"
                placeholder="Quantity"
                type="number"
                onChange={handleChange}
            />

            <input
                name="image"
                placeholder="Image"
                onChange={handleChange}
            />

            <button>Add</button>
        </form>
    );
};

export default AddProduct;