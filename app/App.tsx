import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./graphql/client";
import TaskManager from "./components/taskManager";

const App = () => {
    return (
        <ApolloProvider client={client}>
            <TaskManager />
        </ApolloProvider>
    );
};

export default App;
