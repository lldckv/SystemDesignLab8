import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0",
                     import: ["@key","@shareable","@external"])

  type Item @key(fields: "id") {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
  }

  type Query {
    items: [Item!]!
    item(id: ID!): Item
  }

  type Mutation {
    createItem(name: String!, description: String!, price: Float!, stock: Int!): Item!
    updateItem(id: ID!, name: String, description: String, price: Float, stock: Int): Item!
    deleteItem(id: ID!): Boolean!
  }
`;