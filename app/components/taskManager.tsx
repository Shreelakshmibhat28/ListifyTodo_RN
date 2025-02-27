import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import { ApolloClient, InMemoryCache, ApolloProvider, useMutation, gql } from "@apollo/client";
import { GET_TODOS } from "../graphql/queries";

const client = new ApolloClient({
    uri: "https://graphqlzero.almansi.me/api",
    cache: new InMemoryCache(),
});

const ADD_TODO = gql`
    mutation AddTodo($title: String!) {
        createTodo(input: { title: $title }) {
            id
            title
        }
    }
`;

const UPDATE_TODO = gql`
    mutation UpdateTodo($id: ID!, $title: String!) {
        updateTodo(id: $id, input: { title: $title }) {
            id
            title
        }
    }
`;

const DELETE_TODO = gql`
    mutation DeleteTodo($id: ID!) {
        deleteTodo(id: $id)
    }
`;

const TaskManager: React.FC = () => {
    const [task, setTask] = useState<string>("");
    const [editTaskId, setEditTaskId] = useState<string | null>(null);
    const [localTasks, setLocalTasks] = useState<{ id: string; title: string }[]>([]);

    const [addTodo] = useMutation(ADD_TODO, {
        refetchQueries: [{ query: GET_TODOS }],
    });
    
    const [updateTodo] = useMutation(UPDATE_TODO, {
        refetchQueries: [{ query: GET_TODOS }],
    });
    
    const [deleteTodo] = useMutation(DELETE_TODO, {
        refetchQueries: [{ query: GET_TODOS }],
    });
    
    const handleAddOrUpdateTask = async () => {
        if (task) {
            if (editTaskId) {
                await updateTodo({ variables: { id: editTaskId, title: task } });
                setLocalTasks((prevTasks) =>
                    prevTasks.map((t) => (t.id === editTaskId ? { id: editTaskId, title: task } : t))
                );
                setEditTaskId(null);
            } else {
                const { data } = await addTodo({ variables: { title: task } });
                setLocalTasks((prevTasks) => [...prevTasks, { id: data.createTodo.id, title: task }]);
            }
            setTask("");
        }
    };

    const handleEditTask = (id: string, title: string) => {
        setTask(title);
        setEditTaskId(id);
    };

    const handleDeleteTask = async (id: string) => {
        await deleteTodo({ variables: { id } });
        setLocalTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
    };

    const renderItem = ({ item }: { item: { id: string; title: string } }) => (
        <View style={styles.task}>
            <Text style={styles.itemList}>{item.title}</Text>
            <View style={styles.taskButtons}>
                <TouchableOpacity onPress={() => handleEditTask(item.id, item.title)}>
                    <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                    <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ApolloProvider client={client}>
            <View style={styles.container}>
                <Text style={styles.heading}>LISTIFY</Text>
                <Text style={styles.title}>Simplify Your Tasks, Elevate Your Productivity!!</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Add your task here!!"
                    value={task}
                    onChangeText={setTask}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdateTask}>
                    <Text style={styles.addButtonText}>
                        {editTaskId ? "Update Task" : "Add Task"}
                    </Text>
                </TouchableOpacity>
                <FlatList
                    data={localTasks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </ApolloProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 40,
        marginTop: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    heading: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 7,
        color: "blue",
    },
    input: {
        borderWidth: 3,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 18,
    },
    addButton: {
        backgroundColor: "blue",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 18,
    },
    task: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        fontSize: 18,
    },
    itemList: {
        fontSize: 19,
    },
    taskButtons: {
        flexDirection: "row",
    },
    editButton: {
        marginRight: 10,
        color: "green",
        fontWeight: "bold",
        fontSize: 18,
    },
    deleteButton: {
        color: "red",
        fontWeight: "bold",
        fontSize: 18,
    },
});

export default TaskManager;
