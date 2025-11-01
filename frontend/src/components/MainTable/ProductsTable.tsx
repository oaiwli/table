import React from "react";
import { Table, Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { Scan } from "../../types";

interface ProductsTableProps {
  data: Scan[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size: number) => void;
  onDelete: (id: number) => void;
  selectedIds: number[];
  onToggleProduct: (record: Scan, selected: boolean) => void;
  onToggleAll: (selected: boolean, changeRows: Scan[]) => void;
  navigateTo: (id: number) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onDelete,
  selectedIds,
  onToggleProduct,
  onToggleAll,
  navigateTo,
}) => {
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "IP Адрес",
      dataIndex: "ip",
      key: "ip",
      render: (ip: string, record: Scan) => (
        <Button type="link" onClick={() => navigateTo(record.id)}>
          {ip}
        </Button>
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ color: status === "active" ? "green" : "red" }}>
          {status === "active" ? "Активный" : "Неактивный"}
        </span>
      ),
    },
    {
      title: "Дата создания",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("ru-RU"),
    },
    {
      title: "Продукт",
      dataIndex: "product_name",
      key: "product_name",
      render: (name: string) => name || "Не указан",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Scan) => (
        <Popconfirm
          title="Удалить продукт?"
          onConfirm={() => onDelete(record.id)}
        >
          <Button danger size="small" icon={<DeleteOutlined />}>
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      rowSelection={{
        selectedRowKeys: selectedIds,
        onSelect: (record, selected) => onToggleProduct(record, selected),
        onSelectAll: (selected, _selectedRows, changeRows) =>
          onToggleAll(selected, changeRows),
      }}
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: onPageChange,
      }}
    />
  );
};
