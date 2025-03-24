# Migracja font-size z pikseli na rem

## Wprowadzenie

Ten dokument zawiera instrukcje dotyczące migracji jednostek font-size z pikseli (px) na jednostki relatywne (rem) w projekcie. Celem tej migracji jest zwiększenie dostępności i zapewnienie lepszego skalowania czcionek na różnych urządzeniach i przy różnych ustawieniach przeglądarki.

## Dlaczego używamy rem zamiast px?

- **Dostępność**: Jednostka `rem` pozwala użytkownikom na skalowanie tekstu poprzez zmianę ustawień przeglądarki.
- **Spójność**: Wszystkie rozmiary czcionek skalują się proporcjonalnie w zależności od ustawień root font-size.
- **Responsywność**: Łatwiejsze tworzenie responsywnych projektów, gdzie rozmiary tekstu dostosowują się do różnych urządzeń.

## Funkcja konwersji px na rem

W projekcie dodaliśmy funkcję SCSS `px-to-rem`, która ułatwia konwersję wartości pikseli na remy:

```scss
@function px-to-rem($px, $base-font-size: 16px) {
  @return ($px / $base-font-size) * 1rem;
}
```

## Jak korzystać z funkcji px-to-rem

Zamiast używać bezpośrednio wartości w pikselach:

```scss
font-size: 14px;
```

Używaj funkcji px-to-rem:

```scss
font-size: px-to-rem(14px);
```

## Tabela konwersji popularnych wartości

| Piksele | Remy     | Notatki                      |
|---------|----------|------------------------------|
| 10px    | 0.625rem | Używane dla bardzo małych tekstów  |
| 12px    | 0.75rem  | Standardowe małe teksty      |
| 14px    | 0.875rem | Typowy tekst w formularzach  |
| 16px    | 1rem     | Bazowy rozmiar czcionki      |
| 18px    | 1.125rem | Często używane dla ikon      |
| 20px    | 1.25rem  | Większe ikony                |
| 24px    | 1.5rem   | Nagłówki i elementy wyróżnione |

## Proces migracji

1. Zidentyfikuj wszystkie wystąpienia `font-size` z jednostką px za pomocą grep:
   ```
   grep -r "font-size: [0-9]\+px" --include="*.scss" src/
   ```

2. Zastąp znalezione wystąpienia funkcją `px-to-rem`:
   ```scss
   // Przed
   font-size: 14px;
   
   // Po
   font-size: px-to-rem(14px);
   ```

3. Przetestuj zmiany na różnych urządzeniach i przy różnych ustawieniach czcionki w przeglądarce.

## Uwagi

- Pamiętaj, że `$base-font-size` jest ustawiony na 16px, co odpowiada domyślnemu rozmiarowi czcionki przeglądarek.
- Dla zachowania spójności, używaj funkcji `px-to-rem` także dla innych właściwości związanych z tekstem, takich jak `line-height`, jeśli są podane w pikselach.
- W niektórych przypadkach, dla bardzo specyficznych stylów, może być konieczne pozostawienie jednostek pikselowych (np. dla border-width).

## Przykłady zastosowania

### W zwykłym stylu
```scss
.example-class {
  font-size: px-to-rem(12px);
  line-height: px-to-rem(18px);
}
```

### W mixinie
```scss
@mixin caption-text {
  font-size: px-to-rem(12px);
  line-height: px-to-rem(16px);
  font-weight: 500;
}
```

### Z modyfikatorem
```scss
.large-text {
  font-size: px-to-rem(20px);
}
``` 
