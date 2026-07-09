import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";

function App() {
    return (
        <BrowserRouter>
            <Routes>
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
                        element={<Home />}
                    />

                    <Route
                        path="products/add"
                        element={<AddProduct />}
                    />

                    <Route
                        path="products/edit/:id"
                        element={<EditProduct />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;