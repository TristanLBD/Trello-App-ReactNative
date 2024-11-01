import { View, Text, Image, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { listeAlbums } from '../service/album'
import { AppContext } from '../store/appContext'
import FicheAlbum from '../components/ficheAlbum'
import { listePhotos } from '../service/photo'
import { globalStyle } from '../styles/globalStyle'

export default function ListeAlbum({ navigation }) {
    const [albums, setAlbums] = useState([])
    const { user, refresh } = useContext(AppContext)

    useEffect(() => {
        const fetchAlbumsWithPhotos = async () => {
            try {
                const allAlbums = await listeAlbums(user.uid)
                const albumsWithPhotos = await Promise.all(
                    allAlbums.map(async (album) => {
                        const photos = await listePhotos(user.uid, album.id)
                        return { 
                            ...album, 
                            photos: photos.photos,
                            firstPhotoUrl: photos.photos.length > 0 ? photos.photos[0].url : null
                        }
                    })
                )
                setAlbums(albumsWithPhotos)
            } catch (err) {
                console.error(err)
            }
        }

        fetchAlbumsWithPhotos()
    }, [refresh, user.uid])

    return (
        <ScrollView>
            {albums.map(album => (
                <View key={album.id}>
                    <FicheAlbum nom={album.titre} nav={navigation.navigate} />
                    {album.firstPhotoUrl && (
                        <Image 
                            source={{ uri: album.firstPhotoUrl }} 
                            style={[globalStyle.image, { height: 100, width: '100%' }]} 
                            resizeMode="cover"
                        />
                    )}
                </View>
            ))}
        </ScrollView>
    )
}
