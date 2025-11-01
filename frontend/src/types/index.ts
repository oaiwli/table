export interface Scan {
  id: number;
  ip: string;
  status: "active" | "inactive";
  created_at: string;
  product_id?: number;
  product_name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
