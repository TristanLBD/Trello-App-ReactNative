import { getDatabase, ref, onValue, set, child, get } from "firebase/database";
import { app } from "./app";

const db = getDatabase(app);

export function listeAlbums(email) {
    return new Promise((res, rej) => {
        if (email == "") rej("Email non transmis")
        else {
            const listeAlbRef = ref(db, 'albums/' + email);
            onValue(listeAlbRef, (snapshot) => {
                let data = snapshot.val();
                if (data == "" || data == null) data = []
                res(data)
            });
        }
    })
}
export function createAlbum(email, nom) {
    return new Promise((res, rej) => {
        if (email == "") rej("Email non transmis")
        else if (nom == "") rej("titre album vide")
        else {
            const dbRef = ref(getDatabase());
            console.log(dbRef);
            const enfant = child(dbRef, 'albums/' + email)
            console.log(enfant);
            try {
                get(enfant).then((snapshot) => {
                    let data = snapshot.val()
                    console.log(data);
                    if (data == "" || data == null) data = [];
                    data.push({
                        titre: nom, photos: []

                    })
                    set(ref(db, 'albums/' + email), data);
                    res(data)
                })
                    .catch(err => console.log(err))
            }
            catch (error) {
                console.log(error);
            }
        }
    })
}