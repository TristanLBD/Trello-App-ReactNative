import React, { useState, useContext, useEffect } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal } from 'react-native'
import { AppContext } from '../store/appContext'
import { getBoard, renameBoard, deleteBoard } from '../service/board'
import ColorPicker from 'react-native-wheel-color-picker'
import { Ionicons } from '@expo/vector-icons'
import BoardSettingColumnItem from '../components/BoardSettingColumnItem'
import { deleteColumn, addColumn, updateColumn } from '../service/column'

export default function BoardSettings({ route, navigation }) {
    const [board, setBoard] = useState(null)
    const [newColumnTitle, setNewColumnTitle] = useState('')
    const [newColumnColor, setNewColumnColor] = useState('#FFFFFF')
    const [newBoardTitle, setNewBoardTitle] = useState('')
    const { user, refresh, setRefresh } = useContext(AppContext)
    const { boardId } = route.params
    const [editingColumn, setEditingColumn] = useState(null)
    const [editColumnTitle, setEditColumnTitle] = useState('')
    const [editColumnColor, setEditColumnColor] = useState('')
    const [editModalVisible, setEditModalVisible] = useState(false)

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const boardData = await getBoard(user.uid, boardId)
                setBoard(boardData)
                setNewBoardTitle(boardData.titre)
            } catch (err) {
                console.error(err)
                Alert.alert('Erreur', 'Impossible de charger le board')
            }
        }
        fetchBoard()
    }, [refresh, user.uid, boardId])

    const handleAddColumn = async () => {
        if (newColumnTitle.trim() === '') {
            Alert.alert('Erreur', 'Le titre de la colonne ne peut pas être vide')
            return
        }
        try {
            await addColumn(user.uid, boardId, newColumnTitle, newColumnColor)
            setNewColumnTitle('')
            setNewColumnColor('#FFFFFF')
            setRefresh(!refresh)
            Alert.alert('Succès', 'Colonne ajoutée avec succès')
        } catch (err) {
            console.error(err)
            Alert.alert('Erreur', 'Impossible d\'ajouter la colonne')
        }
    }

    const handleRenameBoard = async () => {
        if (newBoardTitle.trim() === '') {
            Alert.alert('Erreur', 'Le titre du board ne peut pas être vide')
            return
        }
        try {
            await renameBoard(user.uid, boardId, newBoardTitle)
            setRefresh(!refresh)
            Alert.alert('Succès', 'Board renommé avec succès')
            navigation.setOptions({ title: newBoardTitle })
        } catch (err) {
            console.error(err)
            Alert.alert('Erreur', 'Impossible de renommer le board')
        }
    }

    const handleDeleteBoard = () => {
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer ce board ?",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Supprimer", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteBoard(user.uid, boardId)
                            setRefresh(!refresh)
                            navigation.goBack()
                        } catch (err) {
                            console.error(err)
                            Alert.alert('Erreur', 'Impossible de supprimer le board')
                        }
                    }
                }
            ]
        )
    }

    const handleDeleteColumn = async (columnId) => {
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer cette colonne ?",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Supprimer", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteColumn(user.uid, boardId, columnId)
                            setRefresh(!refresh)  // Ceci devrait déclencher un rechargement du board
                            Alert.alert('Succès', 'Colonne supprimée avec succès')
                        } catch (err) {
                            console.error(err)
                            Alert.alert('Erreur', 'Impossible de supprimer la colonne')
                        }
                    }
                }
            ]
        )
    }

    const handleEditColumn = (column) => {
        setEditingColumn(column)
        setEditColumnTitle(column.titre)
        setEditColumnColor(column.color)
        setEditModalVisible(true)
    }

    const handleUpdateColumn = async () => {
        if (editColumnTitle.trim() === '') {
            Alert.alert('Erreur', 'Le titre de la colonne ne peut pas être vide')
            return
        }
        try {
            await updateColumn(user.uid, boardId, editingColumn.id, editColumnTitle, editColumnColor)
            setEditModalVisible(false)
            setRefresh(!refresh)
            Alert.alert('Succès', 'Colonne mise à jour avec succès')
        } catch (err) {
            console.error(err)
            Alert.alert('Erreur', 'Impossible de mettre à jour la colonne')
        }
    }
    
    if (!board) return <Text>Chargement...</Text>

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Paramètres du board</Text>
                <TouchableOpacity onPress={handleDeleteBoard}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.renameBoardContainer}>
                <TextInput
                    style={styles.input}
                    value={newBoardTitle}
                    onChangeText={setNewBoardTitle}
                    placeholder="Nouveau titre du board"
                />
                <Button title="Renommer le board" onPress={handleRenameBoard} />
            </View>

            <View style={styles.addColumnContainer}>
                <TextInput
                    style={styles.input}
                    value={newColumnTitle}
                    onChangeText={setNewColumnTitle}
                    placeholder="Titre de la nouvelle colonne"
                />
                <View style={styles.colorPickerContainer}>
                    <ColorPicker
                        color={newColumnColor}
                        onColorChange={setNewColumnColor}
                        thumbSize={40}
                        sliderSize={40}
                        noSnap={true}
                        row={false}
                    />
                </View>
                <Button title="Ajouter une colonne" onPress={handleAddColumn} />
            </View>

            <Text style={styles.columnListTitle}>Liste des colonnes</Text>
            {board.columns && board.columns.map(column => (
                <BoardSettingColumnItem 
                    key={column.id} 
                    column={column} 
                    onDelete={() => handleDeleteColumn(column.id)}
                    onEdit={() => handleEditColumn(column)}
                />
            ))}
            
            {/* Modal pour éditer une colonne */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <TextInput
                        style={styles.input}
                        value={editColumnTitle}
                        onChangeText={setEditColumnTitle}
                        placeholder="Nouveau titre de la colonne"
                    />
                    <ColorPicker
                        color={editColumnColor}
                        onColorChange={setEditColumnColor}
                        thumbSize={40}
                        sliderSize={40}
                        noSnap={true}
                        row={false}
                    />
                    <Button style={styles.updateButton} title="Mettre à jour la colonne" onPress={handleUpdateColumn} />
                    <Button title="Annuler" onPress={() => setEditModalVisible(false)} />
                </View>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    renameBoardContainer: {
        marginBottom: 20,
    },
    addColumnContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    colorPickerContainer: {
        marginBottom: 20,
    },
    columnListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    columnItem: {
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
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
    updateButton: {
        padding: 35
    }
})
