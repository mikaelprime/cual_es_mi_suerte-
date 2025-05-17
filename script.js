let frases = [];
let idiomaActual = 'es';

window.addEventListener('DOMContentLoaded', () => {

let contador = parseInt(localStorage.getItem('contador')) || 0;
document.getElementById('contador').textContent `Has probado tu suerte ${contador} veces.`;

  function cargarFrases(idioma) {
    const archivo = idioma === 'en' ? 'frases_en.json' : 'frases.json';

    fetch(archivo + '?nocache=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el archivo: " + res.status);
        return res.json();
      })
      .then(data => {
        console.log("Contenido del JSON:", data);
        frases = data;
        idiomaActual = idioma;
        console.log(`Frases en ${idioma === 'en' ? 'inglés' : 'español'} cargadas.`);
      })
      .catch(err => {
        console.error('Error al cargar las frases:', err);
      });
  }

  document.getElementById('selectorIdioma').addEventListener('change', e => {
    cargarFrases(e.target.value);
  });

  cargarFrases('es');

  async function mostrarSuerte() {
    const frase = frases[Math.floor(Math.random() * frases.length)];
    document.getElementById("frase").textContent = frase;

    const response = await fetch('random.wasm');
    const buffer = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(buffer);
    const numero = instance.exports.obtenerAleatorio();
    const tipoPtr = instance.exports.tipoSuerte(numero);

    const memory = new Uint8Array(instance.exports.memory.buffer);
    let tipo = "";
    for (let i = tipoPtr; memory[i] !== 0; i++) {
      tipo += String.fromCharCode(memory[i]);
    }

    document.getElementById("resultado").textContent = `Tu número de suerte es ${numero} (${tipo})`;
    document.getElementById("reintentar").classList.add("visible");

    contador++;
    localStorage.setItem('contador', contador);
    document.getElementById('contador').textContent = `Has tu suerte ${contador} veces.`;
  }

  document.querySelector('button').addEventListener('click', mostrarSuerte);
  document.getElementById('reintentar').addEventListener('click', mostrarSuerte);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado:', reg))
      .catch(err => console.error('SW error:', err));
  });
}

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
      loader.classList.add('hide');
  }
});