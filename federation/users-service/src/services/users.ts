import { prisma } from "../database/config";
import { Role, User } from "../models/user";

export const findUsers = async (): Promise<User[]> => {
  const users = await prisma.user.findMany();
  return users.map((u: any) => ({
    id: u.id.toString(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    phone: u.phone || undefined,
    address: u.address || undefined,
    city: u.city || undefined,
    state: u.state || undefined,
    country: u.country || undefined,
    zip: u.zip || undefined,
  }));
};

export const findUserById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  if (!user) return null;
  return {
    id: user.id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
    address: user.address || undefined,
    city: user.city || undefined,
    state: user.state || undefined,
    country: user.country || undefined,
    zip: user.zip || undefined,
  };
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  if (!user) return null;
  return {
    id: user.id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    role: user.role,
    phone: user.phone || undefined,
    address: user.address || undefined,
    city: user.city || undefined,
    state: user.state || undefined,
    country: user.country || undefined,
    zip: user.zip || undefined,
  }
}

export const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  country: string,
  zip: string,
  role: Role = 'USER',
): Promise<User> => {
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
      city,
      state,
      country,
      zip,
    },
  });
  return {
    id: user.id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
    address: user.address || undefined,
    city: user.city || undefined,
    state: user.state || undefined,
    country: user.country || undefined,
    zip: user.zip || undefined,
  };
};

export const updateUser = async (
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  }
) => {
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data,
  });
  return {
    id: user.id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
    address: user.address || undefined,
    city: user.city || undefined,
    state: user.state || undefined,
    country: user.country || undefined,
    zip: user.zip || undefined,
  };
};

export const deleteUser = async (id: string): Promise<boolean> => {
  await prisma.user.delete({ where: { id: Number(id) } });
  return true;
};