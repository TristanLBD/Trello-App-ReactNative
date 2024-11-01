import { View, Text, Button, TextInput, Keyboard } from 'react-native'
import React, { useContext, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { globalStyle } from '../styles/globalStyle'
import { connectUser } from '../service/auth'
import { AppContext } from '../store/appContext'


export default function Login() {
    const [mail, setMail] = useState("")
    const [mdp, setMdp] = useState("")
    const { setUser } = useContext(AppContext)

    const handleLogin = async () => {
        Keyboard.dismiss()
        console.log(mail, mdp);
        //appaler Firebase
        try {
            const user = await connectUser(mail, mdp)
            console.log(user);
            setUser(user)
        } catch (err) {
            console.error(err);

        }


    }

    return (
        <View style={globalStyle.container}>
            <Text style={globalStyle.label}>Entrez votre mail</Text>
            <TextInput style={globalStyle.input} keyboardType="email-address" value={mail} onChangeText={setMail} />
            <Text style={globalStyle.label}>Entrez votre mot de passe</Text>
            <TextInput style={globalStyle.input} secureTextEntry={true} value={mdp} onChangeText={setMdp} />
            <Button title='Login' onPress={handleLogin} />
            <StatusBar style='auto' />
        </View>

    )
}