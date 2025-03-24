#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skrypt do generowania fontu Ryczalt-Icons z plików SVG
Wymaga zainstalowanego FontForge: https://fontforge.org/

Uruchomienie:
fontforge -script generate-font.py
"""

import os
import sys
import glob
import psMat
import traceback

# Dodaję komunikat diagnostyczny na początku
print("*** Uruchamianie skryptu generate-font.py ***")
print(f"Katalog bieżący: {os.getcwd()}")
print(f"Pliki w katalogu: {os.listdir('.')}")
print("Ładowanie modułu fontforge...")

try:
    import fontforge
    print("Moduł fontforge załadowany pomyślnie")
except ImportError as e:
    print(f"Błąd podczas importowania modułu fontforge: {e}")
    print("Upewnij się, że FontForge jest zainstalowany poprawnie")
    sys.exit(1)

# Stałe
FONT_NAME = "Ryczalt-Icons"
COPYRIGHT = "Copyright (c) Ryczalt. All rights reserved."
VERSION = "1.0"
OUTPUT_DIR = "../../fonts"
SVG_DIR = "."

print(f"Ustawienia: FONT_NAME={FONT_NAME}, OUTPUT_DIR={OUTPUT_DIR}, SVG_DIR={SVG_DIR}")
print(f"Bezwzględna ścieżka do OUTPUT_DIR: {os.path.abspath(OUTPUT_DIR)}")

# Mapowanie nazw plików SVG na kody Unicode
ICON_MAP = {
    "home": 0xe001,
    "user": 0xe002,
    "settings": 0xe003,
    "mail": 0xe004,
    "calendar": 0xe005,
    "search": 0xe006,
    "bell": 0xe007,
    "heart": 0xe008,
    "star": 0xe009,
    "bookmark": 0xe00a,
    "folder": 0xe00b,
    "file": 0xe00c,
    "image": 0xe00d,
    "video": 0xe00e,
    "music": 0xe00f,
    "chart": 0xe010,
    "globe": 0xe011,
    "location": 0xe012,
    "phone": 0xe013,
    "message": 0xe014,
    "chat": 0xe015,
    "share": 0xe016,
    "send": 0xe017,
    "download": 0xe018,
    "upload": 0xe019,
    "trash": 0xe01a,
    "edit": 0xe01b,
    "check": 0xe01c,
    "close": 0xe01d,
    "plus": 0xe01e,
    "minus": 0xe01f,
    "info": 0xe020,
    "warning": 0xe021,
    "error": 0xe022,
    "lock": 0xe023,
    "unlock": 0xe024,
    "key": 0xe025,
    "shield": 0xe026,
    "flag": 0xe027,
    "tag": 0xe028,
    "cart": 0xe029,
    "credit-card": 0xe02a,
    "gift": 0xe02b,
    "wallet": 0xe02c,
    "truck": 0xe02d,
    "box": 0xe02e,
    "store": 0xe02f,
    "clock": 0xe030,
    "timer": 0xe031,
    "stopwatch": 0xe032,
    "calendar-add": 0xe033,
    "calendar-remove": 0xe034,
    "calendar-check": 0xe035,
    "document": 0xe036,
    "document-add": 0xe037,
    "document-remove": 0xe038,
    "document-check": 0xe039,
    "attach": 0xe03a,
    "link": 0xe03b,
    "unlink": 0xe03c,
    "filter": 0xe03d,
    "sort": 0xe03e,
    "arrow-up": 0xe03f,
    "arrow-down": 0xe040,
    "arrow-left": 0xe041,
    "arrow-right": 0xe042,
    "refresh": 0xe043,
    "sync": 0xe044,
    "undo": 0xe045,
    "redo": 0xe046,
    "zoom-in": 0xe047,
    "zoom-out": 0xe048,
    "expand": 0xe049,
    "collapse": 0xe04a,
    "desktop": 0xe04b,
    "laptop": 0xe04c,
    "tablet": 0xe04d,
    "mobile": 0xe04e,
    "camera": 0xe04f,
    "printer": 0xe050,
    "bluetooth": 0xe051,
    "wifi": 0xe052,
    "cloud": 0xe053,
    "cloud-upload": 0xe054,
    "cloud-download": 0xe055,
    "database": 0xe056,
    "server": 0xe057,
    "code": 0xe058,
    "terminal": 0xe059,
    "dashboard": 0xe05a,
    "chart-bar": 0xe05b,
    "chart-line": 0xe05c,
    "chart-pie": 0xe05d,
    "play": 0xe05e,
    "pause": 0xe05f,
    "stop": 0xe060,
    "fast-forward": 0xe061,
    "rewind": 0xe062,
    "volume-up": 0xe063,
    "volume-down": 0xe064,
    "volume-mute": 0xe065,
    "microphone": 0xe066,
    "headphones": 0xe067,
    "power": 0xe068,
    "menu": 0xe069,
    "more": 0xe06a,
    "more-vertical": 0xe06b,
    "grid": 0xe06c,
    "list": 0xe06d,
    "layout": 0xe06e,
    "sidebar": 0xe06f,
    "view": 0xe070,
    "hide": 0xe071,
    "lightbulb": 0xe072,
    "palette": 0xe073,
    "brush": 0xe074,
    "color": 0xe075,
    "puzzle": 0xe076,
    "plugin": 0xe077,
    "extension": 0xe078,
    "compass": 0xe079,
    "map": 0xe07a,
    "directions": 0xe07b,
    "pin": 0xe07c,
    "target": 0xe07d,
    "aim": 0xe07e,
    "eye": 0xe07f,
}

def create_font():
    """
    Tworzy nowy font i konfiguruje jego podstawowe właściwości
    """
    print("Tworzenie nowego fontu...")
    font = fontforge.font()
    font.fontname = FONT_NAME
    font.familyname = FONT_NAME
    font.fullname = FONT_NAME
    font.copyright = COPYRIGHT
    font.version = VERSION
    font.encoding = "UnicodeFull"

    # Inne ustawienia
    font.em = 1024  # Rozmiar EM square
    font.ascent = 850
    font.descent = 174

    print("Font utworzony pomyślnie")
    return font

def add_icons_to_font(font, svg_dir):
    """
    Dodaje ikony SVG do fontu
    """
    svg_files = glob.glob(os.path.join(svg_dir, "*.svg"))
    print(f"Znaleziono {len(svg_files)} plików SVG w katalogu {svg_dir}: {svg_files}")

    processed_count = 0

    for svg_file in svg_files:
        base_name = os.path.basename(svg_file).replace(".svg", "")

        # Ignoruj pliki, które nie są w mapowaniu
        if base_name not in ICON_MAP:
            print(f"Pomijam {base_name}, nie znaleziono w mapowaniu")
            continue

        unicode_value = ICON_MAP[base_name]

        try:
            # Tworzy nowy glif
            glyph = font.createChar(unicode_value, f"ri-{base_name}")

            # Importuj kontur SVG
            print(f"Importowanie pliku {svg_file}...")
            if not os.path.isfile(svg_file):
                print(f"BŁĄD: Plik {svg_file} nie istnieje!")
                continue

            glyph.importOutlines(svg_file)

            # Centruj i skaluj
            glyph.width = 1024  # Standardowa szerokość glifu
            # Centrowanie glifu
            glyph.transform(psMat.translate(0, 0))
            # Dodatkowo, skalujemy gliph do odpowiedniego rozmiaru
            glyph.round()  # Zaokrąglamy współrzędne do liczb całkowitych
            glyph.simplify()  # Upraszczamy kontury

            print(f"Dodano {base_name} jako U+{unicode_value:X}")
            processed_count += 1

        except Exception as e:
            print(f"Błąd przy dodawaniu {base_name}: {e}")
            print("Szczegóły błędu:")
            traceback.print_exc()

    return processed_count

def main():
    try:
        print(f"Tworzenie fontu {FONT_NAME}...")

        # Stwórz nowy font
        font = create_font()

        # Dodaj ikony
        processed_count = add_icons_to_font(font, SVG_DIR)
        print(f"Dodano {processed_count} ikon do fontu")

        # Przygotuj katalog wyjściowy
        print(f"Tworzenie katalogu wyjściowego: {OUTPUT_DIR}")
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Alternatywna ścieżka wyjściowa (pełna ścieżka od katalogu assets)
        alt_output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../assets/fonts"))
        print(f"Tworzenie alternatywnego katalogu wyjściowego: {alt_output_dir}")
        os.makedirs(alt_output_dir, exist_ok=True)

        # Generuj font
        ttf_path = os.path.join(OUTPUT_DIR, f"{FONT_NAME}.ttf")
        print(f"Generowanie fontu w ścieżce: {ttf_path}")
        font.generate(ttf_path)
        print(f"Wygenerowano font: {ttf_path}")

        # Zapisz również w alternatywnej lokalizacji
        alt_ttf_path = os.path.join(alt_output_dir, f"{FONT_NAME}.ttf")
        print(f"Generowanie fontu w alternatywnej ścieżce: {alt_ttf_path}")
        font.generate(alt_ttf_path)
        print(f"Wygenerowano font również w: {alt_ttf_path}")

        print("Generowanie fontu zakończone pomyślnie")
        return 0
    except Exception as e:
        print(f"Błąd podczas generowania fontu: {e}")
        print("Szczegóły błędu:")
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
