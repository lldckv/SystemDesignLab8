import { ApolloServer, AuthenticationError } from 'apollo-server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './schema';
import { createItem, getItem, getItems, updateItem, deleteItem } from './service/items';
import { JwtPayload, verifyJwt } from './utils/jwt';

const resolvers = {
  Item: {
    __resolveReference(ref: { id: string }) {
      return getItem(Number(ref.id));
    }
  },
  Query: {
    items: () => getItems(),
    item: (_: any, { id }: { id: string }) => getItem(Number(id))
  },
  Mutation: {
    createItem: (_: any, { name, description, price, stock }: { name: string, description: string, price: number, stock: number }, context: any) => {
      if (!context.isAdmin) {
        throw new AuthenticationError('Not authorized');
      }
      return createItem(name, description, price, stock);
    },
    updateItem: (_: any, { id, name, description, price, stock }: { id: string, name?: string, description?: string, price?: number, stock?: number }, context: any) => {
      if (!context.isAdmin) {
        throw new AuthenticationError('Not authorized');
      }
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = price;
      if (stock !== undefined) data.stock = stock;
      return updateItem(Number(id), data);
    },
    deleteItem: (_: any, { id }: { id: string }, context: any) => {
      if (!context.isAdmin) {
        throw new AuthenticationError('Not authorized');
      }
      return deleteItem(Number(id));
    },
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
});

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 Items subgraph ready at ${url}`);
});