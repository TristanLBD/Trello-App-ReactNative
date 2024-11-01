import { View, Text, TextInput, Button, Alert, Keyboard } from 'react-native'
import React, { useContext, useState } from 'react'
import { globalStyle } from '../styles/globalStyle'
import { StatusBar } from 'expo-status-bar'
import { createUser } from '../service/auth'
import { AppContext } from '../store/appContext'

export default function Register() {
    const [mail, setMail] = useState("")
    const [mdp, setMdp] = useState("")
    const [confirm, setConfirm] = useState("")
    const { setUser } = useContext(AppContext)

    const handleRegister = async () => {
        console.log(mail, mdp, confirm);
        Keyboard.dismiss()
        if (mdp != confirm) {
            Alert.alert("Les mots de passes sont différent")
        }
        else {
            //appaler Firebase
            try {
                const user = await createUser(mail, mdp)
                console.log(user);
                setUser(user)
            } catch (err) {
                console.error(err);

            }
        }

    }
    return (
        <View style={globalStyle.container}>
            <Text style={globalStyle.label}>Entrez votre mail</Text>
            <TextInput style={globalStyle.input} keyboardType="email-address" value={mail} onChangeText={setMail} />
            <Text style={globalStyle.label}>Entrez votre mot de passe</Text>
            <TextInput style={globalStyle.input} secureTextEntry={true} value={mdp} onChangeText={setMdp} />
            <Text style={globalStyle.label}>Confirmez votre mot de passe</Text>
            <TextInput style={globalStyle.input} secureTextEntry={true} value={confirm} onChangeText={setConfirm} />
            <Button title='Register' onPress={handleRegister} />
            <StatusBar style='auto' />
        </View>

    )
}