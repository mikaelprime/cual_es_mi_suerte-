let frases = [];

fetch('frases.json')
  .then(res => res.json())
  .then(data => { frases = data; });

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
}
