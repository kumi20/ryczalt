import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true,
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number | string): string {
    value = Number(value)
    if (isNaN(value)) {
      return '';
    }

    // Konwertowanie liczby na string i dzielenie na części
    let [integerPart, decimalPart] = value.toFixed(2).split('.');

    // Dodawanie spacji co 4 znaki od końca
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Łączenie z częścią dziesiętną i zamiana kropki na przecinek
    return `${integerPart},${decimalPart}`;
  }
}
