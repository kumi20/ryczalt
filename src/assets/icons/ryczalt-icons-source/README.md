# Ryczalt-Icons Font Generator

Ten katalog zawiera źródłowe pliki SVG do stworzenia własnego autorskiego zestawu ikon "Ryczalt-Icons".

## Instrukcje generowania fontu

Aby wygenerować font ikon z tych plików SVG, możesz użyć jednego z następujących narzędzi:

### Opcja 1: Automatyczny skrypt Python

Najprostszym sposobem jest użycie dostarczonego skryptu Python, który automatycznie wygeneruje font:

1. Zainstaluj FontForge: https://fontforge.org/
2. Zainstaluj wymagane pakiety Python: `pip install fontforge`
3. Uruchom skrypt generujący:
   ```
   cd src/assets/icons/ryczalt-icons-source
   fontforge -script generate-font.py
   ```
4. Font zostanie wygenerowany w katalogu `src/assets/fonts/`

### Opcja 2: IcoMoon App (online) - ZALECANE

Przygotowaliśmy plik ZIP `ryczalt-icons.zip` zawierający wszystkie ikony SVG, co ułatwi import do IcoMoon.

1. Odwiedź stronę [IcoMoon App](https://icomoon.io/app)
2. Kliknij "Import Icons" i wybierz plik `ryczalt-icons.zip` z tego katalogu
3. Wybierz wszystkie zaimportowane ikony
4. Kliknij "Generate Font" na dole strony
5. W ustawieniach fontu (Preferences), nazwij font "Ryczalt-Icons"
6. Ważne: W zakładce "Codes", przypisz następujące kody Unicode dla ikon:
   - home: e001
   - user: e002
   - settings: e003
   - mail: e004
   - calendar: e005
   - search: e006
7. Pobierz wygenerowany pakiet (Download)
8. Rozpakuj pobrany plik ZIP i skopiuj plik `fonts/Ryczalt-Icons.ttf` do katalogu `src/assets/fonts/`

### Opcja 3: Fontello (online)

1. Odwiedź stronę [Fontello](http://fontello.com/)
2. Kliknij "Custom Icons" i wybierz plik `ryczalt-icons.zip` 
3. Wybierz wszystkie zaimportowane ikony
4. W zakładce "Customize Names" upewnij się, że nazwy ikon są prawidłowe
5. W zakładce "Customize Codes" przypisz odpowiednie kody Unicode jak w pliku _custom-icons.scss
6. Kliknij "Download webfont" po prawej stronie
7. Pobierz wygenerowany pakiet
8. Skopiuj plik .ttf do katalogu `src/assets/fonts/` jako `Ryczalt-Icons.ttf`

### Opcja 4: FontForge (ręcznie)

Jeśli wolisz ręcznie konfigurować font:

1. Zainstaluj [FontForge](https://fontforge.org/)
2. Otwórz FontForge i utwórz nowy font
3. Zaimportuj każdy plik SVG jako nowy glif
4. Przypisz kody Unicode zgodnie z naszym określeniem w pliku _custom-icons.scss
5. Wyeksportuj jako TTF
6. Skopiuj wygenerowany plik .ttf do katalogu `src/assets/fonts/` jako `Ryczalt-Icons.ttf`

## Sprawdzenie działania

Po wygenerowaniu fontu możesz sprawdzić, czy działa poprawnie, otwierając plik `example.html` w przeglądarce. Jeśli font został poprawnie zainstalowany, ikony powinny być widoczne w zakładce "Widok z użyciem fontu".

## Styl ikon

Wszystkie ikony są zaprojektowane w stylu linearnym (liniowym), z następującymi cechami:

- Minimalistyczny, prosty design
- Jednolita grubość linii (1.5px)
- Zaokrąglone zakończenia linii
- Czytelne nawet w małych rozmiarach
- Kontury zamiast wypełnień
- Spójny styl w całym zestawie

## Użycie ikon w projekcie

Po wygenerowaniu fontu, możesz używać ikon w kodzie HTML, dodając klasę `ryczalt-icon` wraz z klasą konkretnej ikony:

```html
<i class="ryczalt-icon ri-home"></i>
<i class="ryczalt-icon ri-user"></i>
<i class="ryczalt-icon ri-settings"></i>
```

W komponentach Angular:

```html
<span class="ryczalt-icon ri-mail"></span>
```

## Dodawanie nowych ikon

Aby dodać nowe ikony do zestawu:

1. Stwórz nowy plik SVG o wymiarach 24x24px
2. Zachowaj spójny styl z istniejącymi ikonami
3. Nazwij plik w sposób opisowy (np. `search.svg`)
4. Dodaj definicję ikony w pliku `src/assets/scss/_custom-icons.scss`
5. Dodaj mapowanie kodu Unicode w pliku `generate-font.py`
6. Wygeneruj font ponownie zgodnie z powyższymi instrukcjami

## Licencja

Te ikony są autorskim dziełem i mogą być używane tylko w ramach projektu Ryczalt. 
