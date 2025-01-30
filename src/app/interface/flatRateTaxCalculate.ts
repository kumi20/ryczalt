export interface FlatRateTaxCalculateRequest {
  income: number;                        // Przychód
  reductionAmountPreviousMonth: number;  // Kwota obniżenia podstawy opodatkowania za poprzedni miesiąc
  socialInsurance: number;               // Składka społeczna do odliczenia w bieżącym miesiącu
  reductionAmountHealt: number;          // Kwota odliczenia od zapłaconej składki zdrowotnej
  reduceTaxPreviousMonth: number;        // Kwota obniżenia ryczałtu za poprzedni miesiąc
}

export interface FlatRateTaxCalculateResponse {
  baseTax: number;
  amountFlatRateTax: number;
  reduceTaxNextMonth: number;
  transferHealt: number;
  income: number;                        // Dodane pole
  socialInsurance: number;               // Dodane pole
  reductionAmountHealt: number;         // Dodane brakujące pole
  reduceTaxPreviousMonth: number;        // Dodane brakujące pole
}
