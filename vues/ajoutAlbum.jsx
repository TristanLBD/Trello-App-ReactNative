import { View, Text, TextInput, Button, Keyboard } from 'react-native'
import React, { useContext, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { globalStyle } from '../styles/globalStyle'
import { AppContext } from '../store/appContext'
import { createAlbum } from '../service/album'

export default function AjoutAlbum({ navigation }) {
    const [nom, setNom] = useState("")
    const { user, setRefresh, refresh } = useContext(AppContext)

    const handleAjout = async () => {
        Keyboard.dismiss()
        try {
            const album = await createAlbum(user.uid, nom)
            setRefresh(!refresh)
            navigation.navigate("listeAlbum")
        } catch (err) {
            console.error(err);

        }
    }
    return (
        <View style={globalStyle.container}>
            <Text style={globalStyle.label}>Entrez le nom de votre album</Text>
            <TextInput style={globalStyle.input} value={nom} onChangeText={setNom} />
            <Button title='Ajout' onPress={handleAjout} />
            <StatusBar style='auto' />
        </View>
    )
}