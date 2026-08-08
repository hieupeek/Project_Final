import axios from "axios";
import type { Customer } from "../types/Customer";
import { API_BASE_URL } from "../api/config";

const API = `${API_BASE_URL}/customers`;

export const getCustomers = async (): Promise<Customer[]> => {
    const res = await axios.get<Customer[]>(API);
    return res.data;
};

export const getCustomer = async (id: string): Promise<Customer> => {
    const res = await axios.get<Customer>(`${API}/${id}`);
    return res.data;
};

export const addCustomer = async (customer: Customer): Promise<Customer> => {
    const res = await axios.post<Customer>(API, customer);
    return res.data;
};

export const updateCustomer = async (
    id: string,
    customer: Customer
): Promise<Customer> => {
    const res = await axios.put<Customer>(`${API}/${id}`, customer);
    return res.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await axios.delete(`${API}/${id}`);
};
