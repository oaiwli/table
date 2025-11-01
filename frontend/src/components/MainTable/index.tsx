import React, { useState } from "react";
import { Card, message } from "antd";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../../api/productsApi";
import { selectedProductsStore } from "../../store/selectedProductsStore";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsTable } from "./ProductsTable";

export const MainTable: React.FC = observer(() => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filters, setFilters] = useState({ ip: "", status: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", page, pageSize, filters],
    queryFn: () => productsApi.getProducts(page, pageSize, filters),
  });

  const deleteProduct = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      message.success("Удалено");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProducts = useMutation({
    mutationFn: productsApi.deleteProducts,
    onSuccess: () => {
      message.success("Выбранные удалены");
      selectedProductsStore.clearAll();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  if (error) return <div>Ошибка загрузки данных</div>;

  return (
    <Card>
      <ProductsFilters
        filters={filters}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        selectedCount={selectedProductsStore.selectedIds.length}
        onBatchDelete={() =>
          deleteProducts.mutate(selectedProductsStore.selectedIds)
        }
      />

      <ProductsTable
        data={data?.data || []}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
        onDelete={(id) => deleteProduct.mutate(id)}
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
  );
});
