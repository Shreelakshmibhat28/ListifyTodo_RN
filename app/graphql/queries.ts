import { gql } from "@apollo/client";

export const GET_TODOS = gql`
    query GetTodos {
        todos {
            data {
                id
                title
            }
        }
    }
`;

export const ADD_TODO = gql`
    mutation AddTodo($title: String!) {
        createTodo(input: { title: $title }) {
            id
            title
        }
    }
`;

export const UPDATE_TODO = gql`
    mutation UpdateTodo($id: ID!, $title: String!) {
        updateTodo(id: $id, input: { title: $title }) {
            id
            title
        }
    }
`;

export const DELETE_TODO = gql`
    mutation DeleteTodo($id: ID!) {
        deleteTodo(id: $id)
    }
`;



