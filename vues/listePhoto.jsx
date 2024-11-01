import { View, Text, Image, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../store/appContext'
import { listePhotos } from '../service/photo'
import { globalStyle } from '../styles/globalStyle'

export default function ListePhoto() {
    const { album, user, refresh } = useContext(AppContext)
    const [photos, setPhotos] = useState({ photos: [] })
    useEffect(() => {
        listePhotos(user.uid, album).then(data => {
            console.log("liste photos", data);

            setPhotos(data)
        }).catch(err => console.error(err))
    }, [refresh])
    return (
        <ScrollView>
            {photos.photos.map(photo => <Image resizeMode='contain' key={photo.url} source={{ uri: photo.url }} style={globalStyle.image} />)}
        </ScrollView>
    )
}