import { getDatabase, ref, onValue, set, child, get } from "firebase/database";
import { getDownloadURL, getStorage, ref as refB, uploadBytes } from "firebase/storage";
import { app } from "./app";

const storage = getStorage(app);
const db = getDatabase(app);

export function uploadFile(fich, nom) {
    return new Promise((res, rej) => {
        // Why are we using XMLHttpRequest? See: // https://github.com/expo/expo/issues/2402#issuecomment-443726662 
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", fich, true);
            xhr.send(null);
        }).then(blob => {
            console.log(blob);
            const fileRef = refB(storage, nom);
            uploadBytes(fileRef, blob)
                .then(snapshot => {
                    // We're done with the blob, close and release it 
                    blob.close();
                    res(getDownloadURL(fileRef))
                })
        })
            .catch(err => rej(err.message))
    })
}

export function ajoutePhoto(email, album, fich, nom) {
    return new Promise((res, rej) => {
        if (email == "") rej("Email non transmis")
        else if (album === undefined || album === "") rej("titre album vide")
        else if (fich == "") rej("aucune photo transmise")
        else if (nom == "") rej("nom photo vide")
        else {
            uploadFile(fich, nom)
                .then(urlFich => {
                    const dbRef = ref(getDatabase());
                    const enfant = child(dbRef, 'albums/' + email + "/")
                    console.log(enfant);
                    try {
                        get(enfant)
                            .then((snapshot) => {
                                let data = snapshot.val()
                                console.log(data);
                                let ret = ""
                                if (data == "" || data == null) data = []
                                const indexAlbum = data.findIndex(a => a.titre == album)
                                if (indexAlbum == -1) ret = { titre: "non transmi", photos: [] }
                                else {
                                    if (data[indexAlbum].photos == undefined) data[indexAlbum].photos = []
                                    data[indexAlbum].photos.push({ url: urlFich })
                                    ret = data[indexAlbum]
                                    set(ref(db, 'albums/' + email + "/"), data);
                                }
                                res(ret)
                                // res(true)
                            })
                            .catch(err => console.log(err))
                    } catch (error) {
                        console.log(error);
                    }
                })
                .catch(err => rej(err))
        }
    })
}

export function listePhotos(email, album) {
    return new Promise((res, rej) => {
        if (email == "") rej("Email non transmis")
        else {
            const listeAlbRef = ref(db, `albums/${email}`);
            onValue(listeAlbRef, (snapshot) => {
                let data = snapshot.val();
                console.log(data);
                let ret = ""
                if (data == "" || data == null) data = []
                const indexAlbum = data.findIndex(a => a.titre == album)
                if (indexAlbum == -1) ret = { titre: "non transmi", photos: [] }
                else {
                    if (data[indexAlbum].photos == undefined) data[indexAlbum].photos = []
                    ret = data[indexAlbum]
                }
                res(ret)
            });
        }
    })
}