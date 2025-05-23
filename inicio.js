document.addEventListener('DOMContentLoaded', () => {
    const botonInicio = document.getElementById('btnIrSuerte');

    if (botonInicio) {
        botonInicio.addEventListener('click', () => {
            window.location.href = 'misuerte.html';
        });
    }
});