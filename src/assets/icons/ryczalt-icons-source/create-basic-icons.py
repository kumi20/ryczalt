#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skrypt do tworzenia podstawowych ikon SVG bez potrzeby użycia FontForge.
Tworzy proste pliki SVG dla najczęściej używanych ikon.

Uruchomienie:
python3 create-basic-icons.py
"""

import os

# Definicje ikon w formacie SVG
ICON_DEFINITIONS = {
    # Plus - prosty znak plus
    "plus": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="12" y1="5" x2="12" y2="19"></line>
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>''',

    # Edit - ikona edycji (ołówek)
    "edit": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
</svg>''',

    # Minus - prosty znak minus
    "minus": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>''',

    # Check - znacznik wyboru
    "check": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"></polyline>
</svg>''',

    # Close - ikona zamknięcia (X)
    "close": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>''',

    # Info - ikona informacyjna
    "info": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="12" y1="16" x2="12" y2="12"></line>
  <line x1="12" y1="8" x2="12.01" y2="8"></line>
</svg>''',

    # Warning - ikona ostrzeżenia
    "warning": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
  <line x1="12" y1="9" x2="12" y2="13"></line>
  <line x1="12" y1="17" x2="12.01" y2="17"></line>
</svg>''',

    # Error - ikona błędu
    "error": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="15" y1="9" x2="9" y2="15"></line>
  <line x1="9" y1="9" x2="15" y2="15"></line>
</svg>''',

    # Trash - ikona kosza
    "trash": '''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  <line x1="10" y1="11" x2="10" y2="17"></line>
  <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>''',
}

def create_icons(output_dir="."):
    """
    Tworzy pliki SVG dla ikon w podanym katalogu.
    """
    created_count = 0
    failed_count = 0

    print(f"Tworzenie ikon w katalogu: {output_dir}")

    for icon_name, svg_content in ICON_DEFINITIONS.items():
        output_file = os.path.join(output_dir, f"{icon_name}.svg")

        try:
            # Sprawdź, czy plik już istnieje
            if os.path.exists(output_file):
                print(f"Plik {output_file} już istnieje. Pomijam.")
                continue

            # Zapisz plik SVG
            with open(output_file, "w") as f:
                f.write(svg_content)

            print(f"Utworzono ikonę: {icon_name}.svg")
            created_count += 1

        except Exception as e:
            print(f"Błąd podczas tworzenia ikony {icon_name}: {e}")
            failed_count += 1

    return created_count, failed_count

def main():
    created_count, failed_count = create_icons()

    print(f"\nPodsumowanie: utworzono {created_count} ikon, nie udało się utworzyć {failed_count} ikon")

    if created_count > 0:
        print("\nIkony zostały utworzone pomyślnie. Teraz możesz wygenerować czcionkę Ryczalt-Icons")
        print("używając skryptu generate-font.sh lub generate-font.py.")

    return 0

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)
