import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

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
                        element={<Home />}
                    />

                    <Route
                        path="add"
                        element={<AddProduct />}
                    />

                    <Route
                        path="edit/:id"
                        element={<EditProduct />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;