import { prisma } from "../database/config";
import { Item } from "../models/item";

export const getItems = async (): Promise<Item[]> => {
  const items = await prisma.item.findMany();
  return items.map((i: any): Item => ({
    id: i.id,
    name: i.name,
    description: i.description,
    price: i.price,
    stock: i.stock,
  }));
}

export const getItem = async (id: number): Promise<Item | null> => {
  const item = await prisma.item.findUnique({
    where: {
      id: id
    }
  });
  if (!item) {
    return null;
  }
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    stock: item.stock,
  };
}

export const createItem = async (name: string, description: string, price: number, stock: number = 0): Promise<Item> => {
  const newItem = await prisma.item.create({
    data: {
      name,
      description,
      price,
      stock,
    },
  });
  return {
    id: newItem.id,
    name: newItem.name,
    description: newItem.description,
    price: newItem.price,
    stock: newItem.stock,
  };
}

export const updateItem = async (
  id: number,
  data: { name?: string; description?: string; price?: number; stock?: number }
): Promise<Item> => {
  const updated = await prisma.item.update({
    where: { id },
    data,
  });
  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    price: updated.price,
    stock: updated.stock,
  };
}

export const deleteItem = async (id: number): Promise<boolean> => {
  await prisma.item.delete({ where: { id } });
  return true;
}