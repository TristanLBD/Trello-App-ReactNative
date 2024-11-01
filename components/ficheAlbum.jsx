import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { globalStyle } from '../styles/globalStyle'
import { AppContext } from '../store/appContext'

export default function FicheAlbum({ nom, nav }) {
    const { setAlbum } = useContext(AppContext)
    return (
        <TouchableOpacity style={globalStyle.link} onPress={() => {
            setAlbum(nom)
            nav("Photos")
        }}>
            <Text>{nom}</Text>
        </TouchableOpacity>
    )
}