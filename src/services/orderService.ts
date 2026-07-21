import axios from "axios";
import type { Order } from "../types/Order";

const API = "http://localhost:3000/orders";

export const createOrder = async (order: Order): Promise<Order> => {
    const res = await axios.post<Order>(API, order);
    return res.data;
};
