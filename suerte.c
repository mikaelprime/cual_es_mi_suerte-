#include <stdlib.h>
#include <time.h>
#include <string.h>

int random_seeded = 0;

int obtenerAleatorio() {
    if (!random_seeded) {
        srand(time(NULL));
        random_seeded = 1;
    }
    return (rand() % 100) + 1;
}

const char* tipoSuerte(int valor) {
    if (valor > 70) return "Buena suerte";
    if (valor < 30) return "Mala suerte";
    return "Suerte neutral";
}
