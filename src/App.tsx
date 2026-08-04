import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";

import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Employees from "./pages/Employees";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import Invoice from "./pages/Invoice";
import Customers from "./pages/Customers";
import Profile from "./pages/Profile";

import SalesHistory from "./pages/SalesHistory";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Auth Routes */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    {/* App Layout Routes */}
                    <Route
                        path="/"
                        element={<MainLayout />}
                    >
                        <Route
                            index
                            element={<Welcome />}
                        />

                        <Route
                            path="products"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="products/add"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <AddProduct />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="products/edit/:id"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <EditProduct />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="employees"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <Employees />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="customers"
                            element={
                                <ProtectedRoute>
                                    <Customers />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="sales"
                            element={
                                <ProtectedRoute>
                                    <Sales />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="invoice"
                            element={
                                <ProtectedRoute>
                                    <Invoice />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="sales-history"
                            element={
                                <ProtectedRoute>
                                    <SalesHistory />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;