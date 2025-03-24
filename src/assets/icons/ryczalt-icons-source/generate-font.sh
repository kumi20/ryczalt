#!/bin/bash

# Ten skrypt generuje font ikon przy użyciu kontenera Docker z FontForge
# Dzięki temu nie jest konieczna instalacja FontForge lokalnie

echo "Generowanie fontu Ryczalt-Icons przy użyciu Dockera..."

# Sprawdź, czy Docker jest zainstalowany
if ! command -v docker &> /dev/null; then
    echo "Docker nie jest zainstalowany. Zainstaluj Docker lub użyj innej metody z README.md."
    exit 1
fi

# Pobierz obraz Docker z FontForge
echo "Pobieranie obrazu Docker z FontForge..."
docker pull bartzaalberg/fontforge

# Utwórz katalog docelowy, jeśli nie istnieje
mkdir -p ../../fonts
echo "Utworzono katalog ../../fonts"

# Pokażmy ścieżkę bieżącego katalogu dla diagnostyki
echo "Bieżący katalog: $(pwd)"
echo "Zawartość katalogu: $(ls -la)"

# Uruchom kontener Docker z FontForge i wykonaj skrypt generowania
echo "Uruchamianie skryptu generowania fontu..."
docker run --rm -v "$(pwd):/workdir" -w "/workdir" bartzaalberg/fontforge fontforge -script generate-font.py

# Sprawdź kod wyjścia
DOCKER_EXIT_CODE=$?
echo "Kod wyjścia Docker: $DOCKER_EXIT_CODE"
if [ $DOCKER_EXIT_CODE -ne 0 ]; then
    echo "Wystąpił błąd podczas uruchamiania kontenera Docker (kod: $DOCKER_EXIT_CODE)."
    echo "Spróbuj uruchomić ręcznie:"
    echo "docker run --rm -v \"$(pwd):/workdir\" -w \"/workdir\" bartzaalberg/fontforge fontforge -script generate-font.py"
    exit 1
fi

echo "Sprawdzanie, czy font został wygenerowany..."
if [ -f "../../fonts/Ryczalt-Icons.ttf" ]; then
    echo "Font został pomyślnie wygenerowany w katalogu ../../fonts/"
    ls -la ../../fonts/Ryczalt-Icons.ttf

    # Dodatkowo kopiujemy do katalogu assets/fonts
    mkdir -p ../../../assets/fonts
    cp ../../fonts/Ryczalt-Icons.ttf ../../../assets/fonts/
    echo "Font został również skopiowany do katalogu ../../../assets/fonts/"
    ls -la ../../../assets/fonts/Ryczalt-Icons.ttf

    echo "Gotowe! Możesz teraz używać Ryczalt-Icons w swoim projekcie."
else
    echo "Wystąpił błąd podczas generowania fontu."
    echo "Sprawdź zawartość katalogu ../../fonts/:"
    ls -la ../../fonts/
    exit 1
fi
