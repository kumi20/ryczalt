export interface  Sales{
    net23: number;
    vat23: number;
    net8: number;
    vat8: number;
    net5: number;
    vat5: number;
    net0: number;
    export0: number;
    wdt0: number;
    wsu: number;
    exemptSales: number;
    reverseCharge: number;
    totalNetSales: number;
    totalVatSales: number;
    totalGrossSales: number;
}

export interface Purchase {
  net23: number;
  vat23: number;
  net8: number;
  vat8: number;
  net5: number;
  vat5: number;
  zwNet23: number;
  zwVat23: number;
  zwNet8: number;
  zwVat8: number;
  zwNet5: number;
  zwVat5: number;
  netNotDeductible: number;
  totalGrossPurchase: number;
  totalNetDeductible: number;
  totalVatDeductible: number;
}

export interface Summary {
  vatBalance: number;
  netBalance: number;
  grossBalance: number;
}

export interface Total {
  allNetSales: number;
  allVatSales: number;
  allGrossSales: number;
  allNetPurchase: number;
  allVatPurchase: number;
  allGrossPurchase: number;
}

export interface MonthlyData {
  purchase: Purchase;
  sales: Sales;
  summary: Summary;
  total: Total;
}

export interface MonthlyReport {
  monthlyData: MonthlyData[];
  yearSummary: MonthlyData[];
}
