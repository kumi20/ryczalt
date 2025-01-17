export interface VatRegisterBuy {
  vatRegisterId: number;
  documentTypeId: number;
  documentDate: string;
  taxLiabilityDate: string;
  dateOfSell: string;
  documentNumber: string;
  customerId: number;
  customerName: string;
  isClosed: boolean;
  grossSum: number;
  vatSum: number;
}

export interface VatRegister {
  vatRegisterId: number;
  documentTypeId: number;
  documentDate: string;
  taxLiabilityDate: string;
  dateOfSell: string;
  documentNumber: string;
  customerId: number;
  rate23Net: number;
  rate23Vat: number;
  rate23Gross: number;
  rate8Net: number;
  rate8Vat: number;
  rate8Gross: number;
  rate5Net: number;
  rate5Vat: number;
  rate5Gross: number;
  rate0: number;
  export0: number;
  wdt0: number;
  wsu: number;
  exemptSales: number;
  reverseCharge: number;
  isDelivery: boolean;
  isServices: boolean;
  isCustomerPayer: boolean;
  isThreeSided: boolean;
  companyId: number;
  isClosed: boolean;
  ryczltId: number;
  isSell: boolean;
  customerName: string;
  grossSum: number;
  vatSum: number;
}


export interface SummaryMonthVatRegiser{
  TotalGrossSales: number;
  Net23: number;
  Vat23: number;
  Net8: number;
  Vat8: number;
  Net5: number;
  Vat5: number;
  Net0: number;
  Export0: number;
  WDT0: number;
  WSU: number;
  ExemptSales: number;
  ReverseCharge: number;
  TotalNetSales: number
  TotalVat: number

}

export interface VatPurchaseSummary {
// Basic values
total_net_23: number;      // Suma netto 23%
total_vat_23: number;      // Suma VAT 23%
total_net_8: number;       // Suma netto 8%
total_vat_8: number;       // Suma VAT 8%
total_net_5: number;       // Suma netto 5%
total_vat_5: number;       // Suma VAT 5%

// Tax-exempt values (ZW)
total_zw_net_23: number;   // Suma netto zwolnione 23%
total_zw_vat_23: number;   // Suma VAT zwolnione 23%
total_zw_net_8: number;    // Suma netto zwolnione 8%
total_zw_vat_8: number;    // Suma VAT zwolnione 8%
total_zw_net_5: number;    // Suma netto zwolnione 5%
total_zw_vat_5: number;    // Suma VAT zwolnione 5%

// Totals
total_net: number;                 // Suma wszystkich wartości netto
total_net_not_deductible: number;  // Suma niepodlegających odliczeniu
total_gross: number;               // Suma wszystkich wartości brutto
total_net_deductible: number;      // Suma nieprzysługujących odliczeń
total_vat_deductible: number;      // Suma VAT podlegającego odliczeniu (z uwzględnieniem deduction50)
}
