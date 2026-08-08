import axios from "axios";
import type { Order } from "../types/Order";
import { API_BASE_URL } from "../api/config";

const API = `${API_BASE_URL}/orders`;

export const getOrders = async (): Promise<Order[]> => {
    const res = await axios.get<Order[]>(API);
    return res.data;
};

export const getOrder = async (id: string): Promise<Order> => {
    const res = await axios.get<Order>(`${API}/${id}`);
    return res.data;
};

export const createOrder = async (order: Order): Promise<Order> => {
    const res = await axios.post<Order>(API, order);
    return res.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
    await axios.delete(`${API}/${id}`);
};
