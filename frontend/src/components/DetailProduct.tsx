import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Descriptions, Tag, Space } from "antd";
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

  if (error) {
    return (
      <Card>
        <div>Ошибка при загрузке данных продукта</div>
        <Button onClick={() => navigate("/")}>Вернуться к списку</Button>
      </Card>
    );
  }

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!product) {
    return (
      <Card>
        <div>Продукт не найден</div>
        <Button onClick={() => navigate("/")}>Вернуться к списку</Button>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
          Назад к списку
        </Button>

        <Card title={`Детали продукта #${product.id}`}>
          <Descriptions bordered column={1}>
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
