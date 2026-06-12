import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0",
                     import: ["@key", "@shareable"])

  type User @key(fields: "id") {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: UserRole!
    phone: String
    address: String
    city: String
    state: String
    country: String
    zip: String
  }

  enum UserRole {
    USER
    ADMIN
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    register(firstName: String!, lastName: String!, email: String!, password: String!, phone: String!, address: String!, city: String!, state: String!, country: String!, zip: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;
