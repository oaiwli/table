import React, { useState } from "react";
import { Card, message, Typography, Table, Divider } from "antd";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../../api/productsApi";
import { selectedProductsStore } from "../../store/selectedProductsStore";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsTable } from "./ProductsTable";

const { Title } = Typography;

export const MainTable: React.FC = observer(() => {
  const [pageScans, setPageScans] = useState(1);
  const [pageSizeScans, setPageSizeScans] = useState(10);
  const [filters, setFilters] = useState({ ip: "", status: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: scansData,
    isLoading: isScansLoading,
    error: scansError,
  } = useQuery({
    queryKey: ["scans", pageScans, pageSizeScans, filters],
    queryFn: () => productsApi.getProducts(pageScans, pageSizeScans, filters),
  });

  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getAllProducts(),
  });

  const deleteScan = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      message.success("Сканирование удалено");
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteScans = useMutation({
    mutationFn: productsApi.deleteProducts,
    onSuccess: () => {
      message.success("Выбранные сканирования удалены");
      selectedProductsStore.clearAll();
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  if (scansError || productsError) return <div>Ошибка загрузки данных</div>;

  const productColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "—",
    },
    {
      title: "Дата создания",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Date(date).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <Card
        style={{
          flex: "1 1 48%",
          minWidth: 480,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          Таблица сканирований
        </Title>

        <ProductsFilters
          filters={filters}
          onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
          selectedCount={selectedProductsStore.selectedIds.length}
          onBatchDelete={() =>
            deleteScans.mutate(selectedProductsStore.selectedIds)
          }
        />

        <ProductsTable
          data={scansData?.data || []}
          loading={isScansLoading}
          page={pageScans}
          pageSize={pageSizeScans}
          total={scansData?.total || 0}
          onPageChange={(p, s) => {
            setPageScans(p);
            setPageSizeScans(s);
          }}
          onDelete={(id) => deleteScan.mutate(id)}
          selectedIds={selectedProductsStore.selectedIds}
          onToggleProduct={(record, selected) => {
            if (selected) {
              selectedProductsStore.addProduct(record);
            } else {
              selectedProductsStore.removeProduct(record);
            }
          }}
          onToggleAll={(selected, changeRows) => {
            if (selected) {
              changeRows.forEach((r) => selectedProductsStore.addProduct(r));
            } else {
              changeRows.forEach((r) => selectedProductsStore.removeProduct(r));
            }
          }}
          navigateTo={(id) => navigate(`/product/${id}`)}
        />
      </Card>

      <Card
        style={{
          flex: "1 1 48%",
          minWidth: 480,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          Таблица продуктов
        </Title>

        <Table
          dataSource={productsData?.sort((a: any, b: any) => a.id - b.id) || []}
          columns={productColumns}
          loading={isProductsLoading}
          size="small"
          bordered
          pagination={false}
          rowKey="id"
          style={{ borderRadius: 8 }}
        />
      </Card>
    </div>
  );
});
