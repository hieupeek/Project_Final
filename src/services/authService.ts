import axios from "axios";
import type { User, LoginCredentials, RegisterData } from "../types/User";

const API = "http://localhost:3000/users";
const CURRENT_USER_KEY = "project_final_user";

export const loginApi = async (credentials: LoginCredentials): Promise<User> => {
    try {
        const response = await axios.get<User[]>(API, {
            params: {
                email: credentials.email,
            },
        });

        const users = response.data;
        const user = users.find(
            (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!user) {
            throw new Error("Email không tồn tại trong hệ thống!");
        }

        if (user.password !== credentials.password) {
            throw new Error("Mật khẩu không chính xác!");
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        void password;
        
        // Save to localStorage
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err;
        }
        throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra json-server!");
    }
};

export const registerApi = async (data: RegisterData): Promise<User> => {
    try {
        // Check if email already exists
        const checkRes = await axios.get<User[]>(API, {
            params: { email: data.email },
        });

        if (checkRes.data.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
            throw new Error("Email này đã được sử dụng!");
        }

        const newUser: User = {
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || "employee",
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        };

        const res = await axios.post<User>(API, newUser);
        const { password, ...userWithoutPassword } = res.data;
        void password;

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err;
        }
        throw new Error("Đăng ký thất bại. Vui lòng kiểm tra lại dịch vụ backend!");
    }
};

export const getCurrentUser = (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data) as User;
    } catch {
        return null;
    }
};

export const logoutApi = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};
