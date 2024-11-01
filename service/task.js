import { getDatabase, ref, onValue, set, child, get, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

import { app } from "./app";



const db = getDatabase(app);
const storage = getStorage(app);



export function listeTasks(uid, boardId) {

    return new Promise((res, rej) => {

        if (uid == "") rej("UID non transmis")

        else if (boardId == "") rej("ID du board non transmis")

        else {

            const boardRef = ref(db, `boards/${uid}/${boardId}`);

            onValue(boardRef, (snapshot) => {

                let board = snapshot.val();

                if (board && board.columns) {

                    res(board.columns)

                } else {

                    res([])

                }

            });

        }

    })

}



export async function uploadImage(uri) {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const imageRef = storageRef(storage, `images/${filename}`);
        
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        console.log("Image uploaded, URL:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

export async function createTask(uid, boardId, columnId, titre, description = "", imageUri = null) {
    if (uid == "" || boardId == "" || columnId == "" || titre == "") {
        throw new Error("Informations manquantes");
    }

    let imageUrl = null;
    if (imageUri) {
        console.log("Uploading image...");
        imageUrl = await uploadImage(imageUri);
        console.log("Image uploaded, URL:", imageUrl);
    }

    const boardRef = ref(db, `boards/${uid}`);
    const snapshot = await get(boardRef);
    let boards = snapshot.val();
    if (!boards) throw new Error("Aucun board trouvé");

    const board = boards.find(b => b.id === boardId);
    if (!board) throw new Error("Board non trouvé");

    const columnIndex = board.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) throw new Error("Colonne non trouvée");

    const newTask = {
        id: push(ref(db, 'tasks')).key,
        titre,
        description,
        imageUrl
    };

    if (!board.columns[columnIndex].tasks) {
        board.columns[columnIndex].tasks = [];
    }

    board.columns[columnIndex].tasks.push(newTask);

    await set(boardRef, boards);
    return newTask;
}

export async function updateTask(uid, boardId, columnId, taskId, titre, description = "", imageUri = null) {
    if (uid == "" || boardId == "" || columnId == "" || taskId == "" || titre == "") {
        throw new Error("Informations manquantes");
    }
    
    const boardRef = ref(db, `boards/${uid}`);
    const snapshot = await get(boardRef);
    let boards = snapshot.val();
    if (!boards) throw new Error("Aucun board trouvé");
    
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) throw new Error("Board non trouvé");
    
    const columnIndex = boards[boardIndex].columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) throw new Error("Colonne non trouvée");
    
    const taskIndex = boards[boardIndex].columns[columnIndex].tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error("Tâche non trouvée");
    
    let imageUrl = null;
    if (imageUri === null) {
        // L'image a été supprimée, ne rien faire ici
    } else if (imageUri) {
        if (imageUri.startsWith('http')) {
            imageUrl = imageUri; // L'image n'a pas changé
        } else {
            imageUrl = await uploadImage(imageUri);
        }
    }
    
    boards[boardIndex].columns[columnIndex].tasks[taskIndex] = {
        ...boards[boardIndex].columns[columnIndex].tasks[taskIndex],
        titre,
        description,
        imageUrl
    };
    
    await set(boardRef, boards);
    return boards[boardIndex].columns[columnIndex].tasks[taskIndex];
}

export function deleteTask(uid, boardId, columnId, taskId) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "" || columnId == "" || taskId == "") {
            rej("Informations manquantes")
        } else {
            const boardRef = ref(db, `boards/${uid}`);
            get(boardRef).then((snapshot) => {
                let boards = snapshot.val();
                if (!boards) rej("Aucun board trouvé");
                
                const boardIndex = boards.findIndex(b => b.id === boardId);
                if (boardIndex === -1) rej("Board non trouvé");
                
                const columnIndex = boards[boardIndex].columns.findIndex(col => col.id === columnId);
                if (columnIndex === -1) rej("Colonne non trouvée");
                
                boards[boardIndex].columns[columnIndex].tasks = boards[boardIndex].columns[columnIndex].tasks.filter(t => t.id !== taskId);
                
                set(boardRef, boards)
                    .then(() => res())
                    .catch((error) => rej(error));
            }).catch(err => rej(err));
        }
    });
}

export function moveTask(uid, boardId, fromColumnId, toColumnId, taskId) {
    return new Promise((res, rej) => {
        if (uid == "" || boardId == "" || fromColumnId == "" || toColumnId == "" || taskId == "") {
            rej("Informations manquantes")
        } else {
            const boardRef = ref(db, `boards/${uid}`);
            get(boardRef).then((snapshot) => {
                let boards = snapshot.val();
                if (!boards) rej("Aucun board trouvé");
                
                const boardIndex = boards.findIndex(b => b.id === boardId);
                if (boardIndex === -1) rej("Board non trouvé");
                
                const fromColumnIndex = boards[boardIndex].columns.findIndex(col => col.id === fromColumnId);
                const toColumnIndex = boards[boardIndex].columns.findIndex(col => col.id === toColumnId);
                if (fromColumnIndex === -1 || toColumnIndex === -1) rej("Colonne non trouvée");
                
                // Assurez-vous que les tableaux de tâches existent
                if (!boards[boardIndex].columns[fromColumnIndex].tasks) {
                    boards[boardIndex].columns[fromColumnIndex].tasks = [];
                }
                if (!boards[boardIndex].columns[toColumnIndex].tasks) {
                    boards[boardIndex].columns[toColumnIndex].tasks = [];
                }
                
                const taskIndex = boards[boardIndex].columns[fromColumnIndex].tasks.findIndex(t => t.id === taskId);
                if (taskIndex === -1) rej("Tâche non trouvée");
                
                const task = boards[boardIndex].columns[fromColumnIndex].tasks[taskIndex];
                boards[boardIndex].columns[fromColumnIndex].tasks.splice(taskIndex, 1);
                boards[boardIndex].columns[toColumnIndex].tasks.push({...task, columnId: toColumnId});
                
                set(boardRef, boards)
                    .then(() => res())
                    .catch((error) => rej(error));
            }).catch(err => rej(err));
        }
    });
}
