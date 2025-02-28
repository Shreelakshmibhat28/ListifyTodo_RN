import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client";
import { GET_TODOS, ADD_TODO, UPDATE_TODO, DELETE_TODO } from "../graphql/queries";

const TaskManager: React.FC = () => {
    const [task, setTask] = useState<string>("");
    const [editTaskId, setEditTaskId] = useState<string | null>(null);

    // Fetch existing tasks
    const { data, loading, error, refetch } = useQuery(GET_TODOS);

    // Mutations
    const [addTodo] = useMutation(ADD_TODO, {
        onCompleted: (data) => {refetch(); console.log(data)},
        onError: console.log
    });

    const [updateTodo] = useMutation(UPDATE_TODO, {
        onCompleted: () => refetch(),
    });

    const [deleteTodo] = useMutation(DELETE_TODO, {
        onCompleted: () => refetch(),
        onError: console.log
    });

    if (loading) return <Text style={styles.loading}>Loading...</Text>;
    if (error) return <Text style={styles.error}>Error: {error.message}</Text>;

    // Handle adding/updating tasks
    const handleAddOrUpdateTask = async () => {
        if (task.trim()) {
            if (editTaskId) {
                await updateTodo({
                    variables: { id: editTaskId, input: { title: task } },
                });
                setEditTaskId(null);
            } else {
                await addTodo({
                    variables: { input: { title: task, completed: true } },
                });
            }
            setTask("");
        }
    };

    // Handle editing task
    const handleEditTask = (id: string, title: string) => {
        setTask(title);
        setEditTaskId(id);
    };

    // Handle deleting task
    const handleDeleteTask = async (id: string) => {
        await deleteTodo({ variables: { id } });
    };

    return (
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
                data={data?.todos?.data || []}
                renderItem={({ item }) => (
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
                )}
                keyExtractor={(item) => item.id}
            />
        </View>
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
    loading: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 20,
    },
    error: {
        fontSize: 18,
        textAlign: "center",
        color: "red",
        marginTop: 20,
    },
});

export default TaskManager;
