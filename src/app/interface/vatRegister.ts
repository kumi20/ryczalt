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
