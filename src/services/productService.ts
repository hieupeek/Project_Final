import axios from "axios";
import type { Product } from "../types/Product";

const API = "http://localhost:3000/products";

export const getProducts = async (): Promise<Product[]> => {
    const res = await axios.get(API);
     return res.data;
};

export const getProduct = async (id: number): Promise<Product> => {
    const res = await axios.get(`${API}/${id}`);
    return res.data;
};

export const addProduct = async (product: Product) => {
    return axios.post(API, product);
};

export const updateProduct = async (
    id: number,
    product: Product
) => {
    return axios.put(`${API}/${id}`, product);
};

export const deleteProduct = async (id: number) => {
    return axios.delete(`${API}/${id}`);
};