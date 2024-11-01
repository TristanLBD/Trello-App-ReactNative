import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function FicheBoard({ board, navigation }) {
    // Calculer le nombre de tâches de manière sécurisée
    const taskCount = board.columns 
        ? board.columns.reduce((acc, col) => acc + (col.tasks ? col.tasks.length : 0), 0)
        : 0;

    return (
        <View style={styles.boardContainer}>
            <TouchableOpacity style={styles.boardInfo} onPress={() => navigation.navigate('DetailBoard', { boardId: board.id })}>
                <Text style={styles.boardTitle}>{board.titre}</Text>
                <Text style={styles.taskCount}>{taskCount} tâches</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => navigation.navigate('BoardSettings', { boardId: board.id })}
            >
                <Ionicons name="settings-outline" size={24} color="black" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    boardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 10,
        marginBottom: 10,
        borderRadius: 16,
        backgroundColor: '#bbbbbb',
    },
    boardInfo: {
        flex: 1,
    },
    boardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    taskCount: {
        fontSize: 14,
        color: '#666',
    },
    settingsButton: {
        padding: 5,
    },
})
