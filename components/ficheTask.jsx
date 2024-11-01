import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

export default function FicheTask({ task }) {
    return (
        <View style={styles.taskContainer}>
            <Text style={styles.taskTitle}>{task.titre}</Text>
            {task.imageUrl && (
                <Image 
                    source={{ uri: task.imageUrl }} 
                    style={styles.taskImage} 
                    resizeMode="cover"
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    taskContainer: {
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    taskImage: {
        height: 100,
        width: '100%',
        marginTop: 10,
        borderRadius: 3,
    },
})
