import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textFormatter',
  standalone: true,
})
export class TextFormatterPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Zamiana każdego słowa na wersję z dużej litery
    const words = value.toLowerCase().split(' ');

    const formattedWords = words.map((word) => {
      // Zamiana pierwszej litery na dużą dla pozostałych słów
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    // Połączenie słów z powrotem w tekst
    return formattedWords.join(' ');
  }
}
