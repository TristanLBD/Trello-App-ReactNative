import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Dimensions, Image } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import React, { useContext, useEffect, useState } from 'react'
import { getBoard } from '../service/board'
import { AppContext } from '../store/appContext'
import FicheTask from '../components/ficheTask'
import ColorPicker from 'react-native-wheel-color-picker'
import { addColumn } from '../service/column'
import { createTask, updateTask, deleteTask, moveTask } from '../service/task'
import * as ImagePicker from 'expo-image-picker'

const { width } = Dimensions.get('window')

export default function DetailBoard({ route }) {
    const [board, setBoard] = useState(null)
    const { user, refresh, setRefresh } = useContext(AppContext)
    const { boardId } = route.params
    const [modalVisible, setModalVisible] = useState(false)
    const [newColumnTitle, setNewColumnTitle] = useState('')
    const [newColumnColor, setNewColumnColor] = useState('#FFFFFF')
    const [taskModalVisible, setTaskModalVisible] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [newTaskImage, setNewTaskImage] = useState(null)
    const [selectedColumnId, setSelectedColumnId] = useState(null)
    const [editTaskModalVisible, setEditTaskModalVisible] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [editTaskTitle, setEditTaskTitle] = useState('')
    const [editTaskDescription, setEditTaskDescription] = useState('')
    const [editTaskImage, setEditTaskImage] = useState(null)
    const [selectedMoveColumnId, setSelectedMoveColumnId] = useState(null)

    useEffect(() => {
        fetchBoard()
    }, [refresh, user.uid, boardId])

    const fetchBoard = async () => {
        try {
            const boardData = await getBoard(user.uid, boardId)

            if (!boardData.columns) {
                boardData.columns = [];
            }

            // S'assurer que chaque colonne a un tableau de tâches
            boardData.columns = boardData.columns.map(column => ({
                ...column,
                tasks: column.tasks || []
            }))
            setBoard(boardData)
        } catch (err) {
            console.error(err)
            alert('Erreur lors du chargement du board: ' + err)
        }
    }

    const handleAddColumn = async () => {
        if (newColumnTitle.trim() === '') {
            alert('Le titre de la colonne ne peut pas être vide')
            return
        }
        try {
            await addColumn(user.uid, boardId, newColumnTitle, newColumnColor)
            setModalVisible(false)
            setNewColumnTitle('')
            setNewColumnColor('#FFFFFF')
            setRefresh(!refresh)
        } catch (err) {
            console.error(err)
            alert('Erreur lors de la création de la colonne: ' + err)
        }
    }

    const handleAddTask = async () => {
        if (newTaskTitle.trim() === '') {
            alert('Le titre de la tâche ne peut pas être vide')
            return
        }

        if (!user.uid || !boardId || !selectedColumnId) {
            alert('Informations manquantes pour créer la tâche')
            return
        }
        try {
            const newTask = await createTask(user.uid, boardId, selectedColumnId, newTaskTitle, newTaskDescription, newTaskImage)
            setTaskModalVisible(false)
            setNewTaskTitle('')
            setNewTaskDescription('')
            setNewTaskImage(null)
            setRefresh(!refresh)
            
            // Afficher une confirmation
            if (newTask.imageUrl) {
                alert('Tâche créée avec succès. L\'image a été ajoutée à la tâche.')
            } else {
                alert('Tâche créée avec succès.')
            }
        } catch (err) {
            console.error(err)
            alert('Erreur lors de la création de la tâche: ' + err)
        }
    }

    const pickImage = async (isEditMode = false) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log("Image picker result:", result); // Ajoutez cette ligne pour le débogage

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            console.log("Selected image URI:", imageUri); // Ajoutez cette ligne pour le débogage
            if (isEditMode) {
                setEditTaskImage(imageUri);
            } else {
                setNewTaskImage(imageUri);
            }
        }
    };

    const openEditTaskModal = (task, columnId) => {
        setSelectedTask({ ...task, columnId })
        setEditTaskTitle(task.titre)
        setEditTaskDescription(task.description || '')
        setEditTaskImage(task.imageUrl)
        setEditTaskModalVisible(true)
    }

    const handleUpdateTask = async () => {
        if (editTaskTitle.trim() === '') {
            alert('Le titre de la tâche ne peut pas être vide')
            return
        }
        try {
            const updatedTask = await updateTask(user.uid, boardId, selectedTask.columnId, selectedTask.id, editTaskTitle, editTaskDescription, editTaskImage);
            setEditTaskModalVisible(false);
            setSelectedTask(updatedTask);
            setRefresh(!refresh);
            alert('Tâche mise à jour avec succès');
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la mise à jour de la tâche: ' + err);
        }
    };

    const handleDeleteTask = async () => {
        try {
            await deleteTask(user.uid, boardId, selectedTask.columnId, selectedTask.id)
            setEditTaskModalVisible(false)
            setRefresh(!refresh)
        } catch (err) {
            console.error(err)
            alert('Erreur lors de la suppression de la tâche: ' + err)
        }
    }

    const handleMoveTask = async () => {
        if (!selectedMoveColumnId) {
            alert('Veuillez sélectionner une colonne de destination')
            return
        }
        try {
            await moveTask(user.uid, boardId, selectedTask.columnId, selectedMoveColumnId, selectedTask.id)
            
            // Mettre à jour la structure de données locale
            setBoard(prevBoard => {
                const updatedBoard = JSON.parse(JSON.stringify(prevBoard)) // Deep copy
                const sourceColumn = updatedBoard.columns.find(col => col.id === selectedTask.columnId)
                const destColumn = updatedBoard.columns.find(col => col.id === selectedMoveColumnId)
                
                // Retirer la tâche de la colonne source
                sourceColumn.tasks = sourceColumn.tasks.filter(task => task.id !== selectedTask.id)
                
                // Ajouter la tâche à la colonne de destination
                if (!destColumn.tasks) {
                    destColumn.tasks = []
                }
                destColumn.tasks.push({ ...selectedTask, columnId: selectedMoveColumnId })
                
                return updatedBoard
            })
            
            setEditTaskModalVisible(false)
            setRefresh(!refresh)
        } catch (err) {
            console.error(err)
            alert('Erreur lors du déplacement de la tâche: ' + err)
        }
    }

    const handleDeleteImage = async () => {
        try {
            await updateTask(user.uid, boardId, selectedTask.columnId, selectedTask.id, editTaskTitle, editTaskDescription, null);
            setEditTaskImage(null);
            setSelectedTask(prevTask => ({...prevTask, imageUrl: null}));
            alert('Image supprimée avec succès');
            setRefresh(!refresh); // Pour forcer le rafraîchissement de l'interface
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la suppression de l\'image: ' + err);
        }
    };

    if (!board) return <Text>Chargement...</Text>
    return (
        <View style={styles.container}>
            <ScrollView horizontal style={styles.columnsContainer}>
                {board.columns && board.columns.map(column => (
                    <View key={column.id} style={[styles.column, { backgroundColor: column.color }]}>
                        <Text style={styles.columnTitle}>{column.titre}</Text>
                        <ScrollView>
                            {column.tasks && column.tasks.map(task => (
                                <TouchableOpacity key={task.id} onPress={() => openEditTaskModal(task, column.id)}>
                                    <FicheTask task={task} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity 
                            style={styles.addTaskButton} 
                            onPress={() => {
                                setSelectedColumnId(column.id)
                                setTaskModalVisible(true)
                            }}
                        >
                            <Text style={styles.addTaskButtonText}>+ Ajouter une tâche</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>Ajouter une colonne</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <TextInput
                        style={styles.input}
                        value={newColumnTitle}
                        onChangeText={setNewColumnTitle}
                        placeholder="Titre de la colonne"
                    />
                    <ColorPicker
                        color={newColumnColor}
                        onColorChange={setNewColumnColor}
                        thumbSize={40}
                        sliderSize={40}
                        noSnap={true}
                        row={false}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleAddColumn}>
                        <Text style={styles.buttonText}>Créer la colonne</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                        <Text style={styles.buttonText}>Annuler</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={taskModalVisible}
                onRequestClose={() => setTaskModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <TextInput
                        style={styles.input}
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                        placeholder="Titre de la tâche"
                    />
                    <TextInput
                        style={styles.input}
                        value={newTaskDescription}
                        onChangeText={setNewTaskDescription}
                        placeholder="Description de la tâche"
                        multiline
                    />

                    <TouchableOpacity style={styles.button} onPress={() => pickImage(false)}>
                        <Text style={styles.buttonText}>Choisir une image</Text>
                    </TouchableOpacity>
                    {newTaskImage && (
                        <View>
                            <Image 
                                source={{ uri: newTaskImage }} 
                                style={styles.previewImage} 
                            />
                            <Text>Image sélectionnée</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.button} onPress={handleAddTask}>
                        <Text style={styles.buttonText}>Créer la tâche</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setTaskModalVisible(false)}>
                        <Text style={styles.buttonText}>Annuler</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={editTaskModalVisible}
                onRequestClose={() => setEditTaskModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Modifier la tâche</Text>
                    <TextInput
                        style={styles.input}
                        value={editTaskTitle}
                        onChangeText={setEditTaskTitle}
                        placeholder="Titre de la tâche"
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={editTaskDescription}
                        onChangeText={setEditTaskDescription}
                        placeholder="Description de la tâche"
                        multiline
                    />
                    {editTaskImage ? (
                        <View>
                            <Image 
                                source={{ uri: editTaskImage }} 
                                style={styles.previewImage} 
                            />
                            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteImage}>
                                <Text style={styles.buttonText}>Supprimer l'image</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={() => pickImage(true)}>
                            <Text style={styles.buttonText}>Choisir une image</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdateTask}>
                        <Text style={styles.buttonText}>Confirmer les modifications</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.label}>Déplacer vers :</Text>
                    <Picker
                        selectedValue={selectedMoveColumnId}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedMoveColumnId(itemValue)}
                    >
                        <Picker.Item label="Sélectionnez une colonne" value="" />
                        {board.columns.map(column => (
                            <Picker.Item key={column.id} label={column.titre} value={column.id} />
                        ))}
                    </Picker>
                    <TouchableOpacity style={styles.button} onPress={handleMoveTask}>
                        <Text style={styles.buttonText}>Déplacer la tâche</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteTask}>
                        <Text style={styles.buttonText}>Supprimer la tâche</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditTaskModalVisible(false)}>
                        <Text style={styles.buttonText}>Annuler</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>

    )

}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    columnsContainer: {
        flex: 1,
    },
    column: {
        width: width * 0.8,
        marginRight: 10,
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
    columnTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalView: {
        flex: 1,
        margin: 20,
        backgroundColor: "white",
        padding: 35,
        shadowRadius: 4,
        borderRadius: 20,
        shadowColor: "#000",
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        width: '100%',
        borderRadius: 20,
    },
    button: {
        backgroundColor: "#2196F3",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 10,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    addTaskButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    addTaskButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    picker: {
        width: '100%',
        marginBottom: 10,
    },
    previewImage: {
        width: 200,
        height: 200,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 10,
    },
    taskImage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginTop: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    updateButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#f44336',
    },
    cancelButton: {
        backgroundColor: '#9e9e9e',
    },
    ficheTask: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    taskTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    taskDescription: {
        fontSize: 14,
    },
    taskImage: {
        width: '100%',
        height: 100,
        borderRadius: 5,
        marginTop: 5,
    },
})