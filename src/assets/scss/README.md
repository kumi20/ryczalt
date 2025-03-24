# Optymalizacja plików SCSS

## Wprowadzone zmiany

1. **Rozbudowa pliku _mixins.scss** - Plik zawiera wspólne mixiny używane w wielu miejscach projektu:
   - Dodanie globalnych zmiennych dla spójności (np. `$border-radius-default`, `$main-font-size`)
   - Mixiny dla stylów tekstowych (nagłówki, podtytuły, teksty główne, etykiety)
   - Mixiny dla ramek i rozmiarów (`border-radius`, `border`, `border-bottom`)
   - Mixiny dla cieni (`big-shadow`, `small-shadow`, `mobile-shadow`, `focus-shadow`, `no-shadow`)
   - Mixiny dla flexboxa (`flex-container`, `flex-center`, `flex-between`, `flex-column`)
   - Mixiny dla stanów elementów (`state-hover`, `state-active`, `state-disabled`, `state-readonly`)
   - Mixiny dla komponentów UI:
     - Przyciski (`button-base`, `button-hover`, `button-focus`, `button-disabled`)
     - Zakładki (`tab-base`, `tab-text`, `tab-selected`, `tab-hover`)
     - Akordeony (`accordion-hover`, `accordion-icon-before`, `accordion-title-base`, `accordion-opened-title`)
     - Pola formularzy (`input-base`, `input-focus`, `input-hover`, `input-disabled`, `input-text`)
   - Mixiny dla responsywności (`mobile`, `tablet`, `desktop`)

2. **Optymalizacja pliku accordion.scss** - Zastosowanie mixinów dla:
   - Stylów podstawowych
   - Stanów hover, active, focus
   - Elementów ikon i tytułów
   - Ramek i krawędzi

3. **Optymalizacja pliku typography.scss** - Zastąpienie definicji stylów tekstowych mixinami:
   - Nagłówki (`heading-1` do `heading-5`) 
   - Podtytuły (`subheader-short`, `subheader-long`)
   - Teksty główne (`body-text-short`, `body-text-long`)
   - Napisy (`caption-short`, `caption-long`)
   - Etykiety (`label-text`)

4. **Optymalizacja pliku tabs.scss** - Zastosowanie mixinów dla:
   - Podstawowych stylów zakładek
   - Tekstów w zakładkach
   - Stanów hover i selected
   - Usunięcia cieni

5. **Optymalizacja pliku dxInput.scss** - Zastąpienie powtarzających się stylów mixinami:
   - Stylów pól formularzy
   - Stanów pól (readonly, disabled, hover, focus)
   - Stylów tekstu w polach

6. **Optymalizacja pliku dxForm.scss** - Zastosowanie mixinów dla:
   - Nagłówków grup formularzy
   - Etykiet pól

7. **Optymalizacja pliku shadows.scss** - Zastąpienie powtarzających się definicji cieni mixinami

8. **Optymalizacja pliku corners.scss** - Zastąpienie powtarzających się definicji zaokrągleń mixinami

## Korzyści z optymalizacji

1. **Zmniejszenie powtórzeń kodu** - Te same style nie są już powielane w wielu miejscach.
2. **Łatwiejsze utrzymanie** - Zmiany w jednym miejscu (mixin) wpływają na wszystkie miejsca, gdzie jest używany.
3. **Spójność stylów** - Zapewnienie jednolitego wyglądu elementów interfejsu poprzez korzystanie z tych samych mixinów.
4. **Lepsza organizacja kodu** - Kod jest bardziej czytelny i łatwiejszy do zrozumienia dzięki logicznemu pogrupowaniu stylów.
5. **Szybsze wprowadzanie zmian** - Modyfikacje można wprowadzać w jednym miejscu zamiast w wielu plikach.
6. **Szybsze wdrażanie nowych komponentów** - Gotowe mixiny ułatwiają tworzenie nowych elementów zgodnych z istniejącym designem.
7. **Zmniejszenie rozmiaru kodu** - Eliminacja powtórzeń prowadzi do mniejszego rozmiaru plików CSS.

## Instrukcja użycia

Aby skorzystać z mixinów, należy zaimportować plik `_mixins.scss` na początku pliku SCSS:

```scss
@import "./mixins";

// Przykład użycia
.my-element {
  @include font-base(1rem, bold);
  @include border-radius(8px);
  @include small-shadow;
}

// Przykład stylowania przycisku
.my-button {
  @include button-base;
  
  &:hover {
    @include button-hover;
  }
  
  &:focus {
    @include button-focus;
  }
  
  &[disabled] {
    @include button-disabled;
  }
}

// Przykład stylowania pola formularza
.my-input {
  @include input-base;
  
  &:focus {
    @include input-focus;
  }
  
  &:hover {
    @include input-hover;
  }
  
  &[disabled] {
    @include input-disabled;
  }
}
```

## Dalsze możliwości optymalizacji

1. **Utworzenie systemu zmiennych** - Dodanie zmiennych dla często używanych wartości (np. marginesy, paddingów, odstępy).
2. **Rozbudowa mixinów** - Dodanie nowych mixinów dla pozostałych komponentów UI (np. karty, powiadomienia, menu).
3. **Wprowadzenie systemu grid** - Opartego na mixinach dla spójnego układu strony.
4. **Optymalizacja pozostałych plików SCSS** - Zastosowanie mixinów w pozostałych komponentach projektu.
5. **Utworzenie systemu tokenów designu** - Definiowanie podstawowych wartości (kolory, typografia, odstępy) jako tokeny.
6. **Dodanie dokumentacji komponentów** - Utworzenie style guide z przykładami użycia mixinów.
7. **Automatyzacja generowania CSS** - Skonfigurowanie narzędzi do automatycznej kompilacji i optymalizacji CSS. 
