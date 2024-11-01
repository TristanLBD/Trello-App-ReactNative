import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function BoardSettingColumnItem({ column, onDelete, onEdit }) {
    return (
        <View style={[styles.columnItem, { backgroundColor: column.color }]}>
            <Text style={styles.columnTitle}>{column.titre}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                    <Ionicons name="pencil-outline" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    columnItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginBottom: 5,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'black',
    },
    columnTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: 'white',
        borderRadius: 50,
        padding: 5,
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'black',
    },
    deleteButton: {
        backgroundColor: 'white',
        borderRadius: 50,
        padding: 5,
        borderWidth: 2,
        borderColor: 'black',
    },
})
