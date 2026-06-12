import { User } from "../models/user"
import { createUser, findUserByEmail, findUserById, findUsers } from "../services/users"
import { signJwt } from "../utils/jwt"
import { comparePassword, hashPassword } from "../utils/password"

export interface AuthPayload {
  token: string
  user: Omit<User, "password">
}

export const getUsers = async (): Promise<User[]> => {
  return findUsers()
}

export const getUserById = async (id: string): Promise<User | null> => {
  return findUserById(id)
}

export const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  country: string,
  zip: string
): Promise<AuthPayload> => {
  const user = await createUser(
    firstName,
    lastName,
    email,
    hashPassword(password),
    phone,
    address,
    city,
    state,
    country,
    zip
  )
  const token = signJwt({ role: "user", userId: user.id })
  const { password: _, ...safeUser } = user
  return { token, user: safeUser }
}

export const login = async (
  email: string,
  password: string
): Promise<AuthPayload | null> => {
  const user = await findUserByEmail(email)
  if (!user?.password) {
    return null
  }

  const isMatch = comparePassword(password, user.password)
  if (!isMatch) {
    return null
  }

  const token = signJwt({ role: "user", userId: user.id })
  const { password: _, ...safeUser } = user
  return { token, user: safeUser }
}
