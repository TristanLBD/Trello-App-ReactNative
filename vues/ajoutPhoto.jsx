import React, { useContext, useState } from 'react';
import { Button, Image, View, SafeAreaView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { ajoutePhoto } from '../service/photo';
import { AppContext } from '../store/appContext'

export default function AjoutPhoto({ navigation }) {
    const [image, setImage] = useState(null);
    const [nomImg, setNomImg] = useState("")
    const { user, album, refresh, setRefresh } = useContext(AppContext)

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        console.log(result);
        if (!result.cancelled) {
            setImage(result.assets[0].uri);
            let spNomUri = result.assets[0].uri.split('/')
            let nom = spNomUri[spNomUri.length - 1]
            setNomImg(nom)
        }
    };
    const click = () => {
        console.log(user.uid, album, image, nomImg);
        ajoutePhoto(user.uid, album, image, nomImg)
            .then(data => {
                Alert.alert('image uploadé')
                setRefresh(!refresh)
                navigation.navigate("listePhoto")
            })
            .catch(err => Alert.alert(err))
    }
    return (
        <SafeAreaView style={styles.container2}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Button title="Pick an image from camera roll" onPress={pickImage} />
                {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                {image && <TouchableOpacity style={styles.btn} onPress={click}>
                    <Text style={styles.text}>Valider</Text>
                </TouchableOpacity>
                }
                <StatusBar style="auto" />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container2: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
    }, text: {
        fontSize: 30,
        fontWeight: "bold",
        marginVertical: 10,
        textAlign: "center"
    }, btn: {
        backgroundColor: "#007bff",
        paddingHorizontal: 50,
        paddingVertical: 10,
        borderRadius: 5,
        marginVertical: 10
    },
});