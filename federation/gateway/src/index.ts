import { ApolloServer } from 'apollo-server';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';


const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: process.env.USERS_SERVICE_URL || 'http://localhost:4001' },
      { name: 'items', url: process.env.ITEMS_SERVICE_URL || 'http://localhost:4002' },
      { name: 'orders', url: process.env.ORDERS_SERVICE_URL || 'http://localhost:4003' },
    ],
  }),
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (context.authorization) {
          request.http!.headers.set(
            'authorization',
            context.authorization
          );
        }
      }
    });
  }
});

const server = new ApolloServer({
  gateway,
  context: ({ req }) => {
    return {
      authorization: req.headers.authorization || ''
    };
  }
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
