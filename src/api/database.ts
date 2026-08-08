import axios from "axios";
import type { Product } from "../types/Product";
import { API_BASE_URL } from "./config";

const API = `${API_BASE_URL}/products`;

export const getProducts = async () => {
    const res = await axios.get<Product[]>(API);
    return res.data;
};

export const getProduct = async (id: string) => {
    const res = await axios.get<Product>(`${API}/${id}`);
    return res.data;
};

export const addProduct = async (product: Product) => {
    return axios.post(API, product);
};

export const updateProduct = async (
    id: string,
    product: Product
) => {
    return axios.put(`${API}/${id}`, product);
};

export const deleteProduct = async (id: string) => {
    return axios.delete(`${API}/${id}`);
};