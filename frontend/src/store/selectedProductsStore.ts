import { makeAutoObservable } from "mobx";
import type { Scan } from "../types";

class SelectedProductsStore {
  selectedProducts: Scan[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addProduct(product: Scan) {
    if (!this.selectedProducts.find((p) => p.id === product.id)) {
      this.selectedProducts.push(product);
    }
  }

  removeProduct(product: Scan) {
    this.selectedProducts = this.selectedProducts.filter(
      (p) => p.id !== product.id
    );
  }

  clearAll() {
    this.selectedProducts = [];
  }

  get selectedIds(): number[] {
    return this.selectedProducts.map((product) => product.id);
  }

  isSelected(product: Scan): boolean {
    return this.selectedProducts.some((p) => p.id === product.id);
  }

  toggleProduct(product: Scan) {
    if (this.isSelected(product)) {
      this.removeProduct(product);
    } else {
      this.addProduct(product);
    }
  }
}

export const selectedProductsStore = new SelectedProductsStore();
