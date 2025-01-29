export interface FlatRateTax {
  flatRateTaxId: number;
  companyId: number;
  month: number;
  year: number;
  income: number;
  reductionAmountPreviousMonth: number;
  socialInsurance: number;
  reductionAmountHealt: number;
  baseTax: number;
  reduceTaxPreviousMonth: number;
  reduceTaxNextMonth: number;
  transferHealt: number;
  amountFlatRateTax: number;
  dataPayment: Date | null;
  isPaid: boolean;
}

export interface FlatRateTaxResponse {
  data: FlatRateTax[];
}
