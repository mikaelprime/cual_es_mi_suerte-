let frases = [];
let idiomaActual = 'es';
let historial = [];
const favoritos = new Set();
let contador = parseInt(localStorage.getItem('contador')) || 0;

document.addEventListener('DOMContentLoaded', () => {
 
  AOS.init();
  actualizarContador();

  cargarFrases(idiomaActual);

  document.getElementById('botonSuerte').addEventListener('click', mostrarSuerte);
  document.getElementById('reintentar').addEventListener('click', mostrarSuerte);
  document.getElementById('selectorIdioma').addEventListener('change', e => cargarFrases(e.target.value));
  document.getElementById('toggleDarkMode').addEventListener('click', toggleModoOscuro);

  document.addEventListener('keydown', manejarTeclas);
  manejarClicsEasterEgg();

  document.getElementById('resultado').textContent = `✨ Frase del día: "${obtenerFraseDelDia()}"`;

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }

  window.addEventListener('load', () => {
    document.getElementById('preloader')?.classList.add('fade-out');
    setTimeout(() => document.getElementById('preloader')?.remove(), 500);
    document.getElementById('loader')?.classList.add('hide');
  });

  document.body.addEventListener('mousemove', animarTrebol);
});

function actualizarContador() {
  document.getElementById('contador').textContent = `Has probado tu suerte ${contador} veces.`;
}

function cargarFrases(idioma) {
  const archivo = idioma === 'en' ? 'frases_en.json' : 'frases.json';
  fetch(`${archivo}?nocache=${Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error(`No se pudo cargar: ${res.status}`);
      return res.json();
    })
    .then(data => {
      frases = data;
      idiomaActual = idioma;
    })
    .catch(err => console.error('Error al cargar frases:', err));
}

async function mostrarSuerte() {
  if (frases.length === 0) {
    alert('Las frases aún no están cargadas, intenta en unos segundos.');
    return;
  }

  const frase = frases[Math.floor(Math.random() * frases.length)];
  document.getElementById("frase").textContent = frase;
  guardarHistorial(frase);

  try {
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
  } catch {
    document.getElementById("resultado").textContent = "Número de suerte no disponible";
  }

  contador++;
  localStorage.setItem('contador', contador);
  actualizarContador();
  document.getElementById("reintentar").style.display = "inline-block";

  agregarReacciones();
}

function obtenerFraseDelDia() {
  const fecha = new Date().toDateString();
  const suma = fecha.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const lista = frases.length ? frases : [
    "Hoy es un buen día.",
    "La suerte está contigo.",
    "Aprovecha tu energía.",
    "Confía en tu intuición.",
    "Sonríe y todo saldrá bien."
  ];
  return lista[suma % lista.length];
}

function guardarHistorial(frase) {
  historial.push({ frase, fecha: new Date().toLocaleString() });
}

function crearModal(titulo, contenido) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${titulo}</h2>
      <div>${contenido}</div>
      <button onclick="this.closest('.modal').remove()">Cerrar</button>
    </div>`;
  document.body.appendChild(modal);
}

function mostrarHistorial() {
  const contenido = historial.length
    ? `<ul>${historial.map(item => `<li>${item.frase} <small>${item.fecha}</small></li>`).join('')}</ul>`
    : '<p>No hay historial aún.</p>';
  crearModal('Historial de frases', contenido);
}

function mostrarFavoritos() {
  const contenido = favoritos.size
    ? `<ul>${[...favoritos].map(f => `<li>${f}</li>`).join('')}</ul>`
    : '<p>No hay frases favoritas.</p>';
  crearModal('Tus frases favoritas', contenido);
}

function agregarFavorito() {
  const frase = document.getElementById('frase').textContent.trim();
  if (frase) {
    favoritos.add(frase);
    alert('Frase añadida a favoritos.');
  }
}

function agregarReacciones() {
  const contenedorExistente = document.querySelector('.reacciones');
  if (contenedorExistente) contenedorExistente.remove();

  const contenedor = document.createElement('div');
  contenedor.className = 'reacciones';

  const emojis = ['👍', '❤️', '😂', '😮', '😢'];
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.onclick = () => alert(`Gracias por reaccionar ${emoji}!`);
    contenedor.appendChild(btn);
  });

  document.getElementById('resultado').appendChild(contenedor);
}

function toggleModoOscuro() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.getElementById('toggleDarkMode').setAttribute('aria-pressed', isDark.toString());
}

function manejarTeclas(e) {
  if (e.altKey && e.key === 'h') mostrarHistorial();
  if (e.altKey && e.key === 'f') mostrarFavoritos();
  if (e.altKey && e.key === 'a') agregarFavorito();
  if (e.shiftKey && e.key.toLowerCase() === 's') mostrarEasterEgg();
}

function mostrarEasterEgg() {
  const egg = document.getElementById("easterEgg");
  if (egg?.classList.contains("show")) return;
  egg?.classList.add("show");
  setTimeout(() => egg?.classList.remove("show"), 3000);
}

function manejarClicsEasterEgg() {
  let clicks = 0;
  let timer;
  document.getElementById("botonSuerte").addEventListener("click", () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => clicks = 0, 1500);
    if (clicks >= 3) {
      mostrarEasterEgg();
      clicks = 0;
    }
  });
}

function animarTrebol(e) {
  const clover = document.createElement('div');
  clover.className = 'floating-clover';
  clover.textContent = '🍀';
  clover.style.left = `${e.clientX}px`;
  clover.style.top = `${e.clientY}px`;
  document.body.appendChild(clover);
  setTimeout(() => {
    clover.style.opacity = '0';
    setTimeout(() => clover.remove(), 300);
  }, 100);
}