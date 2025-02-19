let palabras = [];
fetch("palabras.json")
    .then((response) => response.json())
    .then((data) => {
        palabras = data.palabras;
        iniciarJuego();
    })
    .catch((error) => console.error("Error al cargar las palabras:", error));

let palabraOculta;
let intentos = 0;
const maxIntentos = 5;
const gridContainer = document.getElementById("grid-container");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

function iniciarJuego() {
    palabraOculta = palabras[Math.floor(Math.random() * palabras.length)].toUpperCase();
    intentos = 0;
    gridContainer.innerHTML = "";
    message.textContent = "";

    for (let i = 0; i < maxIntentos; i++) {
        let row = document.createElement("div");
        row.classList.add("row");
        
        for (let j = 0; j < palabraOculta.length; j++) {
            let input = document.createElement("input");
            input.maxLength = 1;
            input.disabled = i !== 0; // Solo habilita la primera fila
            input.addEventListener("input", handleInput);
            input.addEventListener("keydown", handleKeydown);
            input.dataset.index = j;
            row.appendChild(input);
        }
        gridContainer.appendChild(row);
    }
    document.querySelector(".row input").focus();
}

function handleInput(e) {
    const input = e.target;
    const row = input.parentElement;
    const inputs = Array.from(row.children);
    const regex = /^[A-Z]$/;
    
    input.value = input.value.toUpperCase(); // Convertir a mayúsculas
    if (!regex.test(input.value)) {
        input.value = ""; // Limpiar si no es una letra válida
        return;
    }

    if (input.value.length === 1) {
        const nextInput = inputs[inputs.indexOf(input) + 1];
        if (nextInput) {
            nextInput.focus();
        }
    }
}

function handleKeydown(e) {
    const input = e.target;
    const row = input.parentElement;
    const inputs = Array.from(row.children);
    const index = inputs.indexOf(input);

    if (e.key === "Enter" && inputs.every(input => input.value.length === 1)) {
        validarIntento(inputs.map(input => input.value).join(""), row);
    }

    if (e.key === "Backspace" && index > 0 && input.value === "") {
        const prevInput = inputs[index - 1];
        prevInput.focus();
    }
}

function validarIntento(intento, row) {
    if (intento.length !== palabraOculta.length) return; // Evita intentos incompletos
    
    intentos++;
    const inputs = Array.from(row.children);
    let aciertos = 0;
    let frecuencia = {};

    // Contar la frecuencia de cada letra en la palabra oculta
    for (let letra of palabraOculta) {
        frecuencia[letra] = (frecuencia[letra] || 0) + 1;
    }

    // Primera pasada: marcar letras correctas (verde) y restar del contador
    [...intento].forEach((letra, index) => {
        if (letra === palabraOculta[index]) {
            inputs[index].classList.add("correcto");
            aciertos++;
            frecuencia[letra]--; // Reducir la cantidad de veces que esta letra puede aparecer
        }
    });

    // Segunda pasada: marcar letras en otro lugar (amarillo) solo si hay disponibles
    [...intento].forEach((letra, index) => {
        if (letra !== palabraOculta[index] && palabraOculta.includes(letra) && frecuencia[letra] > 0) {
            inputs[index].classList.add("enotrolugar");
            frecuencia[letra]--; // Reducir la cantidad disponible
        } else if (!inputs[index].classList.contains("correcto")) {
            inputs[index].classList.add("incorrecto");
        }
    });

    // Bloquear la fila actual
    inputs.forEach(input => input.disabled = true);

    if (aciertos === palabraOculta.length) {
        message.textContent = "¡Has ganado!";
        return;
    } else if (intentos === maxIntentos) {
        message.textContent = `Has perdido. La palabra era: ${palabraOculta}`;
        return;
    }
    
    // Habilitar la siguiente fila
    const nextRow = document.querySelectorAll(".row")[intentos];
    if (nextRow) {
        nextRow.querySelectorAll("input").forEach(input => input.disabled = false);
        nextRow.querySelector("input").focus();
    }
}

restartBtn.addEventListener("click", () => {
    iniciarJuego();
});