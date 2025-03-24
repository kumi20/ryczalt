#!/usr/bin/env python3
import subprocess
import os

font_path = '../../fonts/Ryczalt-Icons.ttf'
abs_font_path = os.path.abspath(os.path.join(os.path.dirname(__file__), font_path))

print(f"Sprawdzanie czcionki: {abs_font_path}")
print(f"Plik istnieje: {os.path.exists(abs_font_path)}")
print(f"Rozmiar pliku: {os.path.getsize(abs_font_path)} bajtów")

# Próba listowania glifów za pomocą narzędzia ttx (jeśli jest zainstalowane)
try:
    result = subprocess.run(['ttx', '-t', 'cmap', '-o', '-', abs_font_path],
                           capture_output=True, text=True)
    print("\nMapowanie znaków (cmap):")
    print(result.stdout)
except FileNotFoundError:
    print("\nNarzędzie ttx nie jest zainstalowane. Zainstaluj je używając:")
    print("brew install fonttools")

# Szukanie specyficznie kodu e07f (ikona oka)
print("\nSzukam kodu e07f (ikona oka):")
with open(abs_font_path, 'rb') as f:
    content = f.read()
    eye_code = b'\x00\x7f\x0e'  # Kod e07f w różnych formatach bajtowych
    eye_code_alt = b'\x07\xf0\x0e'

    if eye_code in content:
        print("Znaleziono sekwencję bajtów odpowiadającą kodowi e07f!")
    elif eye_code_alt in content:
        print("Znaleziono alternatywną sekwencję bajtów dla kodu e07f!")
    else:
        print("Nie znaleziono sekwencji bajtów odpowiadającej kodowi e07f.")

print("\nPorady do sprawdzenia ręcznego:")
print("1. Otwórz plik test-simple.html w przeglądarce i sprawdź, czy ikona oka jest wyświetlana")
print("2. Jeśli nie, może to oznaczać problem z eksportem ikony do pliku TTF")
print("3. Spróbuj wygenerować czcionkę ponownie, upewniając się, że wszystkie ikony są uwzględnione")
