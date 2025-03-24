#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skrypt do ekstrahowania ikon z czcionki Lumen-Linear-Icon-Font
i zapisywania ich jako pliki SVG dla Ryczalt-Icons

Wymaga zainstalowanego FontForge: https://fontforge.org/

Uruchomienie:
fontforge -script extract-lumen-icons.py
"""

import os
import sys
import traceback

print("*** Uruchamianie skryptu extract-lumen-icons.py ***")
print("Ładowanie modułu fontforge...")

try:
    import fontforge
    print("Moduł fontforge załadowany pomyślnie")
except ImportError as e:
    print(f"Błąd podczas importowania modułu fontforge: {e}")
    print("Upewnij się, że FontForge jest zainstalowany poprawnie")
    sys.exit(1)

# Ścieżki do plików
LUMEN_FONT_PATH = "../../../assets/fonts/Lumen-Linear-Icon-Font.ttf"
OUTPUT_DIR = "."  # Katalog bieżący

# Lista ikon do wyekstrahowania (nazwa pliku i kod Unicode)
ICONS_TO_EXTRACT = {
    # Priorytetowe ikony, które są potrzebne od razu
    "plus": 0xe01e,
    "edit": 0xe01b,

    # Dodatkowe ikony, które mogą być przydatne
    "minus": 0xe01f,
    "check": 0xe01c,
    "close": 0xe01d,
    "info": 0xe020,
    "warning": 0xe021,
    "error": 0xe022,
    "bell": 0xe007,
    "heart": 0xe008,
    "star": 0xe009,
    "bookmark": 0xe00a,
    "folder": 0xe00b,
    "file": 0xe00c,
    "trash": 0xe01a,
}

def extract_icons_from_font(font_path, output_dir, icons_to_extract):
    """
    Ekstrahuje wybrane ikony z podanej czcionki i zapisuje je jako pliki SVG.
    """
    print(f"Otwieranie czcionki: {font_path}")
    font = fontforge.open(font_path)

    extracted_count = 0
    failed_count = 0

    for icon_name, unicode_value in icons_to_extract.items():
        try:
            # Sprawdź, czy glyf istnieje w czcionce
            if unicode_value not in font:
                print(f"Uwaga: Kod Unicode U+{unicode_value:04X} nie istnieje w czcionce dla ikony {icon_name}")
                continue

            glyph = font[unicode_value]
            output_file = os.path.join(output_dir, f"{icon_name}.svg")

            # Eksport do SVG
            print(f"Eksportowanie ikony {icon_name} (U+{unicode_value:04X}) do pliku {output_file}")

            # Ustaw wymiary i skalowanie
            glyph.width = 1024  # Standardowa szerokość

            # Zapisz jako SVG
            glyph.export(output_file)

            # Modyfikuj plik SVG, aby dostosować go do potrzeb
            fix_svg_file(output_file)

            extracted_count += 1
            print(f"Ikona {icon_name} została pomyślnie wyeksportowana")

        except Exception as e:
            print(f"Błąd podczas eksportowania ikony {icon_name}: {e}")
            traceback.print_exc()
            failed_count += 1

    print(f"\nPodsumowanie: wyeksportowano {extracted_count} ikon, nie udało się wyeksportować {failed_count} ikon")
    return extracted_count

def fix_svg_file(svg_path):
    """
    Poprawia plik SVG, aby był zgodny z wymaganiami Ryczalt-Icons.
    """
    try:
        with open(svg_path, 'r') as file:
            content = file.read()

        # Modyfikacje pliku SVG można dodać tutaj
        # Na przykład, dodanie atrybutów viewBox, usunięcie niepotrzebnych atrybutów itp.

        with open(svg_path, 'w') as file:
            file.write(content)

    except Exception as e:
        print(f"Błąd podczas poprawiania pliku SVG {svg_path}: {e}")

def main():
    try:
        print("Rozpoczynam ekstrakcję ikon z czcionki Lumen...")

        # Sprawdź, czy plik czcionki istnieje
        if not os.path.isfile(LUMEN_FONT_PATH):
            print(f"Błąd: Plik czcionki {LUMEN_FONT_PATH} nie istnieje!")
            return 1

        # Ekstrahuj ikony
        extracted_count = extract_icons_from_font(LUMEN_FONT_PATH, OUTPUT_DIR, ICONS_TO_EXTRACT)

        if extracted_count > 0:
            print(f"\nEkstrakcja zakończona pomyślnie. Wyeksportowano {extracted_count} ikon do katalogu {OUTPUT_DIR}")
            print("Możesz teraz wygenerować czcionkę Ryczalt-Icons przy użyciu skryptu generate-font.sh lub generate-font.py")
        else:
            print("\nNie udało się wyeksportować żadnych ikon.")

        return 0
    except Exception as e:
        print(f"Błąd podczas ekstrakcji ikon: {e}")
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
