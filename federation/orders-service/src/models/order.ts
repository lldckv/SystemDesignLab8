export interface OrderItem {
  orderId: number
  itemId: number
  quantity: number
}

export interface OrderInput {
  itemId: number;
  quantity: number;
}

export interface Order {
  id: number
  userId: number
  items: OrderItem[]
  totalPrice: number
  orderDate: Date
  status: string
  createdAt: Date
  updatedAt: Date
}
