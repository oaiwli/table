import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Descriptions, Tag, Space, Spin, Result } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/productsApi";

export const DetailProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.getProduct(productId),
    enabled: !!productId,
  });

  // --- Загрузка ---
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "80vh",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 16, color: "#888" }}>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Ошибка при загрузке данных продукта"
        subTitle="Попробуйте обновить страницу или вернуться к списку."
        extra={[
          <Button type="primary" key="back" onClick={() => navigate("/")}>
            Вернуться к списку
          </Button>,
        ]}
      />
    );
  }

  if (!product) {
    return (
      <Result
        status="404"
        title="Продукт не найден"
        subTitle="Похоже, такого продукта не существует."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate("/")}>
            Вернуться к списку
          </Button>,
        ]}
      />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/")}
          style={{ alignSelf: "flex-start" }}
        >
          Назад к списку
        </Button>

        <Card
          title={`Детали продукта #${product.id}`}
          bordered
          style={{ borderRadius: 12 }}
        >
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="IP Адрес">
              <strong>{product.ip}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Статус">
              <Tag color={product.status === "active" ? "green" : "red"}>
                {product.status === "active" ? "Активный" : "Неактивный"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Дата создания">
              {new Date(product.created_at).toLocaleString("ru-RU")}
            </Descriptions.Item>
            <Descriptions.Item label="Продукт">
              {product.product_name || "Не указан"}
            </Descriptions.Item>
            <Descriptions.Item label="ID Продукта">
              {product.product_id || "Не указан"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
};
