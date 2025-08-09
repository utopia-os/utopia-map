/**
 * @category Types
 */
export interface FullItemsApi<T> {
  getItems(): Promise<T[]>
  getItem(id: string): Promise<T | null>
  createItem(item: T): Promise<T>
  updateItem(item: Partial<T>): Promise<T>
  deleteItem(id: string): Promise<boolean>
  collectionName?: string
}
