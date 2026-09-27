import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


let curso = 0;
let numeroPregunta = 0;
let puntos = 0;
let puedePasar = false;
let preguntasCorrectas = 0;
let nombreAlumne = "";
let codiClasse = "";
let preguntas = [];
let resultadoGuardado = false;


// ==========================
// EMPEZAR JUEGO
// ==========================

function comencarJoc() {

    nombreAlumne =
        document.getElementById("nomAlumne").value.trim();

    codiClasse =
        document.getElementById("codiClasse").value.trim();

    if (nombreAlumne === "") {
        alert("Escriu el teu nom.");
        return;
    }

    if (codiClasse === "") {
        alert("Escriu el codi de classe.");
        return;
    }

    document.getElementById("pantallaPrincipal").style.display =
        "none";

    document.getElementById("seleccioCurs").style.display =
        "block";
}


// ==========================
// SELECCIONAR CURSO
// ==========================

async function seleccionarCurs(cursoElegido) {

    curso = cursoElegido;

    numeroPregunta = 0;
    puntos = 0;
    preguntasCorrectas = 0;
    puedePasar = false;
    resultadoGuardado = false;
    preguntas = [];

    document.getElementById("seleccioCurs").style.display =
        "none";

    document.getElementById("pantallaJoc").style.display =
        "block";

    document.getElementById("puntuacio").textContent =
        "Punts: 0";

    document.getElementById("seguent").style.display =
        "block";

    await cargarPreguntas();
}


// ==========================
// CARGAR PREGUNTAS
// ==========================

async function cargarPreguntas() {

    try {

        const referencia =
            collection(db, "preguntes");

        const busqueda = query(
            referencia,
            where("curs", "==", curso)
        );

        const resultado =
            await getDocs(busqueda);

        preguntas = [];

        resultado.forEach(function(documento) {

            const pregunta =
                documento.data();

            if (
                pregunta.pregunta &&
                Array.isArray(pregunta.respostes) &&
                pregunta.respostes.length >= 4 &&
                Number(pregunta.correcta) >= 1 &&
                Number(pregunta.correcta) <= 4
            ) {

                preguntas.push(pregunta);
            }
        });


        if (preguntas.length === 0) {

            document.getElementById("pregunta").textContent =
                "No hi ha preguntes per aquest curs.";

            return;
        }


        mostrarPregunta();

    } catch (error) {

        console.error(error);

        document.getElementById("pregunta").textContent =
            "No s'han pogut carregar les preguntes.";
    }
}


// ==========================
// MOSTRAR PREGUNTA
// ==========================

function mostrarPregunta() {

    if (numeroPregunta >= preguntas.length) {

        terminarPartida();

        return;
    }

    const pregunta =
        preguntas[numeroPregunta];

    document.getElementById("titolCurs").textContent =
        nombreCurso();

    document.getElementById("pregunta").textContent =
        pregunta.pregunta;

    document.getElementById("resposta1").textContent =
        "A) " + pregunta.respostes[0];

    document.getElementById("resposta2").textContent =
        "B) " + pregunta.respostes[1];

    document.getElementById("resposta3").textContent =
        "C) " + pregunta.respostes[2];

    document.getElementById("resposta4").textContent =
        "D) " + pregunta.respostes[3];

    document.getElementById("resultat").textContent =
        "";

    document.getElementById("puntuacio").textContent =
        "Punts: " + puntos;

    puedePasar = false;

    activarRespuestas();
}


// ==========================
// NOMBRE CURSO
// ==========================

function nombreCurso() {

    if (curso === 1) return "1r ESO";
    if (curso === 2) return "2n ESO";
    if (curso === 3) return "3r ESO";
    if (curso === 4) return "4t ESO";

    return "ESO";
}


// ==========================
// COMPROBAR RESPUESTA
// ==========================

function comprovarResposta(resposta) {

    if (puedePasar === true) {
        return;
    }

    const pregunta =
        preguntas[numeroPregunta];

    if (!pregunta) {
        return;
    }


    // RESPUESTA CORRECTA

    if (
        Number(resposta) ===
        Number(pregunta.correcta)
    ) {

        puntos += 10;

        preguntasCorrectas++;

        document.getElementById("resultat").textContent =
            "Correcte! 🎉";

    }

    // RESPUESTA INCORRECTA

    else {

        puntos -= 5;

        document.getElementById("resultat").textContent =
            "Incorrecte. ❌ (-5 punts)";
    }


    // Ya se ha respondido esta pregunta

    puedePasar = true;

    desactivarRespuestas();


    document.getElementById("puntuacio").textContent =
        "Punts: " + puntos;
}


// ==========================
// DESACTIVAR RESPUESTAS
// ==========================

function desactivarRespuestas() {

    document.getElementById("resposta1").disabled = true;
    document.getElementById("resposta2").disabled = true;
    document.getElementById("resposta3").disabled = true;
    document.getElementById("resposta4").disabled = true;
}


// ==========================
// ACTIVAR RESPUESTAS
// ==========================

function activarRespuestas() {

    document.getElementById("resposta1").disabled = false;
    document.getElementById("resposta2").disabled = false;
    document.getElementById("resposta3").disabled = false;
    document.getElementById("resposta4").disabled = false;
}


// ==========================
// SIGUIENTE
// ==========================

async function seguentPregunta() {

    if (puedePasar === false) {

        document.getElementById("resultat").textContent =
            "Primer has de respondre.";

        return;
    }


    numeroPregunta++;


    if (numeroPregunta >= preguntas.length) {

        await terminarPartida();

        return;
    }


    mostrarPregunta();
}


// ==========================
// TERMINAR
// ==========================

async function terminarPartida() {

    document.getElementById("pregunta").textContent =
        "Has acabat la partida! 🎉";

    document.getElementById("resultat").textContent =
        "Puntuació final: " + puntos + " punts.";

    document.getElementById("puntuacio").textContent =
        "Punts: " + puntos;

    document.getElementById("seguent").style.display =
        "none";

    desactivarRespuestas();

    await guardarResultado();
}


// ==========================
// GUARDAR RESULTADO
// ==========================

async function guardarResultado() {

    if (resultadoGuardado === true) {
        return;
    }

    resultadoGuardado = true;

    try {

        await addDoc(
            collection(db, "resultats"),
            {

                nomAlumne: nombreAlumne,

                codiClasse: codiClasse,

                curs: curso,

                puntuacio: puntos,

                preguntesCorrectes:
                    preguntasCorrectas,

                totalPreguntes:
                    preguntas.length,

                data: new Date()
            }
        );

        console.log("Resultat guardat");

    } catch (error) {

        console.error(
            "Error guardant resultat:",
            error
        );

        resultadoGuardado = false;
    }
}


// ==========================
// ZONA PROFESSOR
// ==========================

function mostrarZonaProfessor() {

    document.getElementById("pantallaPrincipal").style.display =
        "none";

    document.getElementById("zonaProfessor").style.display =
        "block";
}


// ==========================
// ENTRAR PROFESSOR
// ==========================

function entrarProfessor() {

    const codigo =
        document.getElementById("codiProfessor").value.trim();

    const error =
        document.getElementById("errorProfessor");


    if (codigo === "professorat.lacetania.depcatalà.") {

        error.textContent = "";

        document.getElementById("zonaProfessor").style.display =
            "none";

        document.getElementById("resultatsProfessor").style.display =
            "block";

    } else {

        error.textContent =
            "Codi incorrecte.";
    }
}


// ==========================
// CARGAR RESULTADOS
// ==========================

async function carregarResultats() {

    const codigo =
        document.getElementById("codiClasseProfessor").value.trim();

    const contenedor =
        document.getElementById("llistaResultats");


    if (codigo === "") {

        contenedor.innerHTML =
            "<p>Escriu el codi de classe.</p>";

        return;
    }


    contenedor.innerHTML =
        "<p>Carregant resultats...</p>";


    try {

        const referencia =
            collection(db, "resultats");

        const busqueda = query(
            referencia,
            where("codiClasse", "==", codigo)
        );

        const resultado =
            await getDocs(busqueda);


        if (resultado.empty) {

            contenedor.innerHTML =
                "<p>No hi ha resultats per aquesta classe.</p>";

            return;
        }


        let html = `
            <table>

                <tr>
                    <th>Alumne</th>
                    <th>Curs</th>
                    <th>Punts</th>
                    <th>Correctes</th>
                    <th>Total</th>
                </tr>
        `;


        resultado.forEach(function(documento) {

            const dato =
                documento.data();

            html += `
                <tr>
                    <td>${dato.nomAlumne}</td>
                    <td>${nombreCursoResultado(dato.curs)}</td>
                    <td>${dato.puntuacio}</td>
                    <td>${dato.preguntesCorrectes}</td>
                    <td>${dato.totalPreguntes}</td>
                </tr>
            `;
        });


        html += "</table>";

        contenedor.innerHTML = html;


    } catch (error) {

        console.error(error);

        contenedor.innerHTML =
            "<p>No s'han pogut carregar els resultats.</p>";
    }
}


// ==========================
// CURSO DE LOS RESULTADOS
// ==========================

function nombreCursoResultado(curso) {

    if (curso === 1) return "1r ESO";
    if (curso === 2) return "2n ESO";
    if (curso === 3) return "3r ESO";
    if (curso === 4) return "4t ESO";

    return "ESO";
}


// ==========================
// VOLVER AL INICIO
// ==========================

function tornarInici() {

    document.getElementById("pantallaPrincipal").style.display =
        "block";

    document.getElementById("zonaProfessor").style.display =
        "none";

    document.getElementById("resultatsProfessor").style.display =
        "none";

    document.getElementById("codiProfessor").value =
        "";

    document.getElementById("codiClasseProfessor").value =
        "";

    document.getElementById("errorProfessor").textContent =
        "";

    document.getElementById("llistaResultats").innerHTML =
        "";
}


// ==========================
// FUNCIONES HTML
// ==========================

window.comencarJoc =
    comencarJoc;

window.seleccionarCurs =
    seleccionarCurs;

window.comprovarResposta =
    comprovarResposta;

window.seguentPregunta =
    seguentPregunta;

window.mostrarZonaProfessor =
    mostrarZonaProfessor;

window.entrarProfessor =
    entrarProfessor;

window.carregarResultats =
    carregarResultats;

window.tornarInici =
    tornarInici;