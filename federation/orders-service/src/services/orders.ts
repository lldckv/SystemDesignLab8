import { prisma } from "../database/config";
import { Order, OrderInput, OrderItem } from "../models/order";
import { request, gql } from "graphql-request";

export const getOrders = async (): Promise<Order[]> => {
  const orders = await prisma.order.findMany({ include: { items: true } });
  return mapOrders(orders);
};

export const getOrdersByUser = async (userId: number): Promise<Order[]> => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
  });
  return mapOrders(orders);
};

export const getOrder = async (id: number): Promise<Order | null> => {
  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return o ? mapOrder(o) : null;
};

const ITEMS_SERVICE_URL =
  process.env.ITEMS_SERVICE_URL || "http://localhost:4002/graphql";

const ITEM_PRICE_QUERY = gql`
  query GetItemPrice($id: ID!) {
    item(id: $id) {
      price
    }
  }
`;

export const createOrder = async (
  userId: number,
  items: OrderInput[]
): Promise<Order> => {
  const prices = await Promise.all(
    items.map(({ itemId }) =>
      request<{ item: { price: number } }>(
        ITEMS_SERVICE_URL,
        ITEM_PRICE_QUERY,
        { id: itemId }
      ).then((res) => res.item.price)
    )
  );

  const totalPrice = items.reduce(
    (sum, { quantity }, i) => sum + quantity * prices[i],
    0
  );

  const o = await prisma.order.create({
    data: {
      userId,
      totalPrice,
      status: "PENDING",
      items: {
        create: items.map(({ itemId, quantity }) => ({
          itemId,
          quantity,
        })),
      },
    },
    include: { items: true },
  });
  return mapOrder(o);
};

export const cancelOrder = async (id: number): Promise<boolean> => {
  await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  return true;
};

function mapOrder(o: any): Order {
  return {
    id: o.id,
    userId: o.userId,
    items: o.items.map((i: any): OrderItem => ({
      orderId: i.orderId,
      itemId: i.itemId,
      quantity: i.quantity,
    })),
    totalPrice: o.totalPrice,
    orderDate: o.orderDate,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function mapOrders(raw: any[]): Order[] {
  return raw.map(mapOrder);
}
