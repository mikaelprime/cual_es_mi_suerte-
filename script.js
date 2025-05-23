let frases = [];
let idiomaActual = 'es'; 

window.addEventListener('DOMContentLoaded', () => {
  let contador = parseInt(localStorage.getItem('contador')) || 0;
  document.getElementById('contador').textContent = `Has probado tu suerte ${contador} veces.`;

  function cargarFrases(idioma) {
    const archivo = idioma === 'en' ? 'frases_en.json' : 'frases.json';

    fetch(archivo + '?nocache=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el archivo: " + res.status);
        return res.json();
      })
      .then(data => {
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
    if (frases.length === 0) {
      alert('Las frases aún no están cargadas, intenta nuevamente en unos segundos.');
      return;
    }

    const frase = frases[Math.floor(Math.random() * frases.length)];
    document.getElementById("frase").textContent = frase;

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
    } catch (error) {
      console.warn('Error al cargar el módulo WASM:', error);
      document.getElementById("resultado").textContent = "Número de suerte no disponible";
    }

    document.getElementById("reintentar").style.display = "inline-block";

    contador++;
    localStorage.setItem('contador', contador);
    document.getElementById('contador').textContent = `Has probado tu suerte ${contador} veces.`;
  }

  document.getElementById('botonSuerte').addEventListener('click', mostrarSuerte);
  document.getElementById('reintentar').addEventListener('click', mostrarSuerte);

  AOS.init();

  function mostrarEasterEgg() {
    const egg = document.getElementById("easterEgg");
    if (egg.classList.contains("show")) return;
    egg.classList.add("show");
    setTimeout(() => {
      egg.classList.remove("show");
    }, 3000);
  }

  window.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.key.toLowerCase() === "s") {
      mostrarEasterEgg();
    }
  });

  let clickCount = 0;
  let clickTimer;
  document.getElementById("botonSuerte").addEventListener("click", () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
    if (clickCount >= 3) {
      mostrarEasterEgg();
      clickCount = 0;
    }
  });

  const body = document.body;
  const toggleDarkBtn = document.getElementById('toggleDarkMode');

  const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (preferDark) {
    body.classList.add('dark-mode');
    toggleDarkBtn.setAttribute('aria-pressed', 'true');
  }

  toggleDarkBtn.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-mode');
    toggleDarkBtn.setAttribute('aria-pressed', isDark.toString());
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
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

window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  preloader.classList.add('fade-out');
  setTimeout(() => preloader.style.display = 'none', 500);
});

document.body.addEventListener('mousemove', (e) => {
  const clover = document.createElement ('div');
  clover.className = 'floating-clover';
  clover.textContent = '🍀';
  clover.style.left = `${e.clientX}px`;
  clover.style.top = `${e.clientY}px`;
  document.body.appendChild(clover);
  setTimeout(() => {
    clover.style.opacity = '0';
    setTimeout(() => clover.remove(), 300);
  }, 100);
});