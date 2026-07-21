import axios from "axios";

export interface Employee {
    id: number;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
    status: "active" | "inactive";
}

const API = "http://localhost:3000/employees";

export const getEmployees = async (): Promise<Employee[]> => {
    const res = await axios.get(API);
    return res.data;
};

export const getEmployee = async (id: number): Promise<Employee> => {
    const res = await axios.get(`${API}/${id}`);
    return res.data;
};

export const addEmployee = async (employee: Omit<Employee, "id">): Promise<Employee> => {
    const res = await axios.post(API, employee);
    return res.data;
};

export const updateEmployee = async (id: number, employee: Partial<Employee>): Promise<Employee> => {
    const res = await axios.put(`${API}/${id}`, employee);
    return res.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
    await axios.delete(`${API}/${id}`);
};
