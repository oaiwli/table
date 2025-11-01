import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainTable } from "./components/MainTable/index";
import { DetailProduct } from "./components/DetailProduct";

function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Routes>
          <Route
            path="/"
            element={
              <div style={{ padding: 24 }}>
                <h1>Таблица продуктов</h1>
                <MainTable />
              </div>
            }
          />
          <Route path="/product/:id" element={<DetailProduct />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
