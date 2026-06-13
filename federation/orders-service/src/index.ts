import { ApolloServer, AuthenticationError } from 'apollo-server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './schema';
import {
  getOrder,
  getOrders,
  getOrdersByUser,
  createOrder,
  cancelOrder as cancelOrderService,
} from './services/orders';
import { JwtPayload, verifyJwt } from './utils/jwt';
import { OrderInput } from './models/order';

const resolvers = {
  Order: {
    user(order: any) {
      return { __typename: 'User', id: order.userId };
    },
    items(order: any) {
      return order.items;
    }
  },
  OrderLine: {
    item(line: any) {
      return { __typename: 'Item', id: line.itemId };
    }
  },
  Query: {
    orders: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return context.isAdmin
        ? getOrders()
        : getOrdersByUser(context.user.id);
    },
    order: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      const ord = await getOrder(Number(id));
      if (!ord) return null;
      if (!context.isAdmin && ord.userId !== context.user.id) {
        throw new AuthenticationError('Not authorized');
      }
      return ord;
    }
  },
  Mutation: {
    createOrder: async (
      _: any,
      { items }: { items: { itemId: string; quantity: number }[] },
      context: any
    ) => {
      if (!context.user) throw new AuthenticationError("Not authenticated");
      const userId = Number(context.user.userId);
      const orderItems: OrderInput[] = items.map(({ itemId, quantity }) => ({
        itemId: Number(itemId),
        quantity,
      }));
      return createOrder(userId, orderItems);
    },
    cancelOrder: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return cancelOrderService(Number(id));
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
});

server.listen({ port: 4003 }).then(({ url }) => {
  console.log(`🚀 Orders subgraph ready at ${url}`);
});
