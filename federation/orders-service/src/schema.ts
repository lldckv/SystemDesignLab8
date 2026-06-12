import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0",
                     import: ["@key","@external","@requires"])

  type Order @key(fields: "id") {
    id: ID!
    user: User!
    items: [OrderLine!]!
    totalPrice: Float!
    orderDate: DateTime!
    status: String!
  }

  type OrderLine {
    orderId: ID!
    itemId: ID!
    quantity: Int!
    item: Item!
  }

  scalar DateTime

  input OrderItemInput {
    itemId: ID!
    quantity: Int!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }
  extend type Item @key(fields: "id") {
    id: ID! @external
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createOrder(items: [OrderItemInput!]!): Order!
    cancelOrder(id: ID!): Boolean!
  }
`;