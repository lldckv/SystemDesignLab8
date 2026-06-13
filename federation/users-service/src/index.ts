import { ApolloServer, AuthenticationError } from 'apollo-server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './schema';
import { getUserById, getUsers, login, register } from './controllers/users';
import { JwtPayload, verifyJwt } from './utils/jwt';

export const resolvers = {
  User: {
    __resolveReference(ref: { id: string }) {
      return getUserById(ref.id);
    }
  },
  Query: {
    users: async (_: any, context: any) => {
      if (!context.isAdmin) {
        throw new AuthenticationError('Not authorized');
      }
      return getUsers()
    },
    user: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.isAdmin) {
        throw new AuthenticationError('Not authorized');
      }
      const all = await getUsers();
      const found = all.find(u => u.id === id);
      if (!found) throw new Error('User not found');
      return found;
    }
  },
  Mutation: {
    register: async (_: any, { firstName, lastName, email, password, phone, address, city, state, country, zip }: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    }) => {
      const payload = register(firstName, lastName, email, password, phone, address, city, state, country, zip);
      if (!payload) {
        throw new Error('Invalid credentials');
      }
      return payload
    },
    login: async (_: any, { email, password }: { email: string; password: string }) => {
    const payload = await login(email, password);
    if (!payload) throw new Error('Invalid credentials');
    return payload;
  }
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  context: ({ req }) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim() || ''
    try {
      const user = verifyJwt(token) as JwtPayload
      if (!user) {
        throw new AuthenticationError('Not authenticated')
      }
      if (user.role === ("ADMIN" as JwtPayload['role'])) {
        return { user, isAdmin: true }
      }
      return { user, isAdmin: false }
    } catch {
      return { user: null, isAdmin: false }
    }
  }
})

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Users subgraph ready at ${url}`)
})
