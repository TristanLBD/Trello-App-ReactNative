import { View, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { listeBoards } from '../service/board'
import { AppContext } from '../store/appContext'
import FicheBoard from '../components/ficheBoard'

export default function ListeBoard({ navigation }) {
    const [boards, setBoards] = useState([])
    const { user, refresh } = useContext(AppContext)

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const boardsData = await listeBoards(user.uid)
                setBoards(boardsData)
            } catch (err) {
                console.error(err)
            }
        }

        fetchBoards()
    }, [refresh, user.uid])

    return (
        <ScrollView>
            {boards.map(board => (
                <View key={board.id}>
                    <FicheBoard board={board} navigation={navigation} />
                </View>
            ))}
        </ScrollView>
    )
}
