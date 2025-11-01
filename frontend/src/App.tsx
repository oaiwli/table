import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { MainTable } from "./components/MainTable";
import { DetailProduct } from "./components/DetailProduct";
import { Button } from "antd";

const NotFound: React.FC = () => (
  <div
    style={{
      textAlign: "center",
      paddingTop: 100,
      color: "#555",
    }}
  >
    <h1 style={{ fontSize: 32, marginBottom: 16 }}>Ничего не найдено</h1>
    <p style={{ fontSize: 16, marginBottom: 24 }}>
      Похоже, вы перешли по несуществующей ссылке.
    </p>
    <Link to="/">
      <Button type="primary" size="large">
        Вернуться на главную
      </Button>
    </Link>
  </div>
);

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
