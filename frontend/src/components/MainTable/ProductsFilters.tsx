import React from "react";
import { Input, Select, Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Search } = Input;

interface ProductsFiltersProps {
  filters: { ip: string; status: string };
  onChange: (f: { ip?: string; status?: string }) => void;
  selectedCount: number;
  onBatchDelete: () => void;
}

export const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  filters,
  onChange,
  selectedCount,
  onBatchDelete,
}) => {
  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validValue = value.replace(/[^0-9.]/g, "");
    onChange({ ip: validValue });
  };

  return (
    <div
      style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}
    >
      <Search
        placeholder="Поиск по IP"
        allowClear
        value={filters.ip}
        onChange={handleIpChange}
        onSearch={(value) => onChange({ ip: value.replace(/[^0-9.]/g, "") })}
        style={{ width: 200 }}
      />
      <Select
        placeholder="Статус"
        allowClear
        value={filters.status}
        onChange={(value) => onChange({ status: value })}
        style={{ width: 150 }}
      >
        <Option value="active">Активный</Option>
        <Option value="inactive">Неактивный</Option>
      </Select>

      {selectedCount > 0 && (
        <Popconfirm
          title={`Удалить ${selectedCount} продуктов?`}
          onConfirm={onBatchDelete}
        >
          <Button danger icon={<DeleteOutlined />}>
            Удалить выбранные ({selectedCount})
          </Button>
        </Popconfirm>
      )}
    </div>
  );
};
