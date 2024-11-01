import { getDatabase, ref, onValue, set, child, get, push } from "firebase/database";
import { app } from "./app";

const db = getDatabase(app);

export function createBoard(uid, titre) {
    return new Promise((res, rej) => {
        if (uid == "") rej("UID non transmis")
        else if (titre == "") rej("Titre du board vide")
        else {
            const dbRef = ref(getDatabase());
            const enfant = child(dbRef, 'boards/' + uid)
            try {
                get(enfant).then((snapshot) => {
                    let data = snapshot.val()
                    if (data == "" || data == null) data = [];
                    const newBoard = {
                        id: Date.now().toString(),
                        titre: titre,
                        columns: [] // Assurez-vous que columns est toujours initialisé comme un tableau vide
                    }
                    data.push(newBoard)
                    set(ref(db, 'boards/' + uid), data);
                    res(newBoard)
                })
                .catch(err => console.log(err))
            }
            catch (error) {
                console.log(error);
                rej(error)
            }
        }
    })
}

export function listeBoards(uid) {
    return new Promise((res, rej) => {
        if (uid == "") rej("UID non transmis")
        else {
            const listeBoardRef = ref(db, 'boards/' + uid);
            onValue(listeBoardRef, (snapshot) => {
                let data = snapshot.val();
                if (data == "" || data == null) data = []
                res(data)
            });
        }
    })
}

export function getBoard(uid, boardId) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "") rej("UID ou ID du board non transmis")
        else {
            const boardsRef = ref(db, `boards/${uid}`);
            onValue(boardsRef, (snapshot) => {
                let boards = snapshot.val();
                if (boards == null) {
                    rej("Aucun board trouvé")
                } else {
                    const board = boards.find(b => b.id === boardId);
                    if (board) {
                        res(board)
                    } else {
                        rej("Board non trouvé")
                    }
                }
            });
        }
    })
}

export function renameBoard(uid, boardId, newTitle) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "" || newTitle == "") {
            rej("Informations manquantes")
        } else {
            const boardRef = ref(db, `boards/${uid}`)
            get(boardRef).then((snapshot) => {
                let boards = snapshot.val()
                if (!boards) rej("Aucun board trouvé")
                
                const boardIndex = boards.findIndex(b => b.id === boardId)
                if (boardIndex === -1) rej("Board non trouvé")
                
                boards[boardIndex].titre = newTitle
                
                set(boardRef, boards)
                .then(() => res())
                .catch((error) => rej(error))
            })
            .catch(err => rej(err))
        }
    })
}

export function deleteBoard(uid, boardId) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "") {
            rej("Informations manquantes")
        } else {
            const boardRef = ref(db, `boards/${uid}`)
            get(boardRef).then((snapshot) => {
                let boards = snapshot.val()
                if (!boards) rej("Aucun board trouvé")
                
                const updatedBoards = boards.filter(b => b.id !== boardId)
                
                set(boardRef, updatedBoards)
                .then(() => res())
                .catch((error) => rej(error))
            })
            .catch(err => rej(err))
        }
    })
}