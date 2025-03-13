import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
