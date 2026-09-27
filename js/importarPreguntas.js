import { db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

async function importarPreguntas() {

    try {

        const respuesta = await fetch("./preguntas_1eso.json");

        const preguntas = await respuesta.json();

        console.log("Preguntas encontradas:", preguntas.length);

        for (const pregunta of preguntas) {

            await addDoc(
                collection(db, "preguntes"),
                pregunta
            );

        }

        alert(
            "Importación terminada: " +
            preguntas.length +
            " preguntas."
        );

    } catch (error) {

        console.error("Error:", error);

        alert("Ha ocurrido un error al importar.");
    }
}

window.importarPreguntas = importarPreguntas;