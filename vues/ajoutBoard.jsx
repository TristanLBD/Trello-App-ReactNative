import React, { useState, useContext } from 'react'
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native'
import { createBoard } from '../service/board'
import { AppContext } from '../store/appContext'

export default function AjoutBoard({ navigation }) {
    const [titre, setTitre] = useState('')
    const { user, setRefresh } = useContext(AppContext)

    const handleSubmit = async () => {
        if (titre.trim() === '') {
            Alert.alert('Erreur', 'Le titre du board ne peut pas être vide')
            return
        }

        try {
            await createBoard(user.uid, titre)
            setRefresh(prev => !prev)  // Déclenche un rafraîchissement de la liste des boards
            Alert.alert('Succès', 'Le board a été créé avec succès')
            navigation.goBack()  // Retourne à la liste des boards
        } catch (error) {
            console.error(error)
            Alert.alert('Erreur', 'Impossible de créer le board')
        }
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={titre}
                onChangeText={setTitre}
                placeholder="Titre du board"
            />
            <Button title="Créer le board" onPress={handleSubmit} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        fontSize: 18,
        borderRadius: 6,
        marginBottom: 20,
    }
})
