export interface Scan {
  id: number;
  ip: string;
  status: "active" | "inactive";
  created_at: Date;
  product_id?: number;
  product_name?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
