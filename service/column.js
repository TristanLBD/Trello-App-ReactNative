import { getDatabase, ref, get, set, child, push } from "firebase/database";
import { app } from "./app";

const db = getDatabase(app);

export function addColumn(uid, boardId, columnTitle, columnColor) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "" || columnTitle == "") {
            rej("Informations manquantes")
        } else {
            const boardRef = ref(db, `boards/${uid}`)
            get(boardRef).then((snapshot) => {
                let boards = snapshot.val()
                if (!boards) rej("Aucun board trouvé")
                
                const boardIndex = boards.findIndex(b => b.id === boardId)
                if (boardIndex === -1) rej("Board non trouvé")
                
                if (!boards[boardIndex].columns) boards[boardIndex].columns = []
                
                const newColumn = {
                    id: push(child(ref(db), 'columns')).key,
                    titre: columnTitle,
                    color: columnColor,
                    tasks: []
                }
                
                boards[boardIndex].columns.push(newColumn)
                set(boardRef, boards)
                .then(() => res(newColumn))
                .catch((error) => rej(error))
            })
            .catch(err => rej(err))
        }
    })
}

export function deleteColumn(uid, boardId, columnId) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "" || columnId == "") {
            rej("Informations manquantes")
        } else {
            const boardRef = ref(db, `boards/${uid}`)
            get(boardRef).then((snapshot) => {
                let boards = snapshot.val()
                if (!boards) rej("Aucun board trouvé")
                
                const boardIndex = boards.findIndex(b => b.id === boardId)
                if (boardIndex === -1) rej("Board non trouvé")
                
                if (!boards[boardIndex].columns) {
                    rej("Aucune colonne trouvée dans ce board")
                }
                
                boards[boardIndex].columns = boards[boardIndex].columns.filter(c => c.id !== columnId)
                
                set(boardRef, boards)
                .then(() => res())
                .catch((error) => rej(error))
            })
            .catch(err => rej(err))
        }
    })
}

export function updateColumn(uid, boardId, columnId, newTitle, newColor) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "" || columnId == "" || newTitle == "") {
            rej("Informations manquantes")
        } else {
            const boardRef = ref(db, `boards/${uid}`)
            get(boardRef).then((snapshot) => {
                let boards = snapshot.val()
                if (!boards) rej("Aucun board trouvé")
                
                const boardIndex = boards.findIndex(b => b.id === boardId)
                if (boardIndex === -1) rej("Board non trouvé")
                
                if (!boards[boardIndex].columns) {
                    rej("Aucune colonne trouvée dans ce board")
                }
                
                const columnIndex = boards[boardIndex].columns.findIndex(c => c.id === columnId)
                if (columnIndex === -1) rej("Colonne non trouvée")
                
                boards[boardIndex].columns[columnIndex].titre = newTitle
                boards[boardIndex].columns[columnIndex].color = newColor
                
                set(boardRef, boards)
                .then(() => res())
                .catch((error) => rej(error))
            })
            .catch(err => rej(err))
        }
    })
}
