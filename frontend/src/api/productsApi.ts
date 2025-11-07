import axios from "axios";
import type { Scan, PaginatedResponse } from "../types/index";

const API_BASE_URL = "http://localhost:3001/api";

export const productsApi = {
  getProducts: async (
    page: number,
    pageSize: number,
    filters?: { ip?: string; status?: string }
  ) => {
    const params: any = { page, pageSize };
    if (filters?.ip) params.ip = filters.ip;
    if (filters?.status) params.status = filters.status;

    const response = await axios.get<PaginatedResponse<Scan>>(
      `${API_BASE_URL}/scans`,
      { params }
    );
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/scans/${id}`);
    return response.data;
  },

  deleteProducts: async (ids: number[]) => {
    const response = await axios.delete(`${API_BASE_URL}/scans`, {
      data: { ids },
    });
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await axios.get<Scan>(`${API_BASE_URL}/scans/${id}`);
    return response.data;
  },

  getAllProducts: async () => {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  },
};
