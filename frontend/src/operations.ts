import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $phone: String!
    $address: String!
    $city: String!
    $state: String!
    $country: String!
    $zip: String!
  ) {
    register(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      phone: $phone
      address: $address
      city: $city
      state: $state
      country: $country
      zip: $zip
    ) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;

export const GET_ITEMS = gql`
  query GetItems {
    items {
      id
      name
      description
      price
      stock
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation CreateItem($name: String!, $description: String!, $price: Float!, $stock: Int!) {
    createItem(name: $name, description: $description, price: $price, stock: $stock) {
      id
      name
      description
      price
      stock
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $name: String, $description: String, $price: Float, $stock: Int) {
    updateItem(id: $id, name: $name, description: $description, price: $price, stock: $stock) {
      id
      name
      description
      price
      stock
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id)
  }
`;

export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      totalPrice
      status
      orderDate
      items {
        itemId
        quantity
        item {
          name
          price
        }
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($items: [OrderItemInput!]!) {
    createOrder(items: $items) {
      id
      totalPrice
      status
      orderDate
      items {
        itemId
        quantity
        item {
          name
          price
        }
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($id: ID!) {
    cancelOrder(id: $id)
  }
`;
