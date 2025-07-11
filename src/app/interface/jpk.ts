export interface JpkSubmission {
  submissionId: number;
  jpkType: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  submittedAt: string;
  message?: string;
  year: number;
}

export interface JpkDetails {
  jpkId: number;
  jpkType: string;
  dateFrom: string;
  dateTo: string;
  xmlFilePath: string;
  createdAt: string;
  documents: JpkDocument[];
  summary: JpkSummary;
  salesDocuments: JpkSalesDocument[];
  purchaseDocuments: JpkPurchaseDocument[];
}

export interface JpkDocument {
  documentId: number;
  documentType: string;
  documentNumber: string;
  customerName: string;
  customerNip: string;
  documentDate: string;
  saleDate: string;
  netAmount: number;
  vatAmount: number;
}

export interface JpkSummary {
  totalDocuments: number;
  totalSales: number;
  totalPurchases: number;
  totalNetAmount: number;
  totalVatAmount: number;
  salesSummary: JpkSalesSummary;
  purchasesSummary: JpkPurchasesSummary;
}

export interface JpkSalesSummary {
  totalNet: number;
  totalVat: number;
  rate23Net: number;
  rate23Vat: number;
  rate8Net: number;
  rate8Vat: number;
  rate5Net: number;
  rate5Vat: number;
  rate0: number;
  exemptSales: number;
}

export interface JpkPurchasesSummary {
  totalNet: number;
  totalVat: number;
  rate23Net: number;
  rate23Vat: number;
  rate8Net: number;
  rate8Vat: number;
  rate5Net: number;
  rate5Vat: number;
}

export interface JpkSalesDocument {
  documentId: number;
  documentType: string;
  documentNumber: string;
  customerName: string;
  customerNip: string;
  documentDate: string;
  saleDate: string;
  netAmount: number;
  vatAmount: number;
  rate23Net: number;
  rate23Vat: number;
  rate8Net: number;
  rate8Vat: number;
  rate5Net: number;
  rate5Vat: number;
  rate0: number;
  exemptSales: number;
}

export interface JpkPurchaseDocument {
  documentId: number;
  documentType: string;
  documentNumber: string;
  customerName: string;
  customerNip: string;
  documentDate: string;
  saleDate: string;
  netAmount: number;
  vatAmount: number;
  sell23Net: number;
  sell23Vat: number;
  sell8Net: number;
  sell8Vat: number;
  sell5Net: number;
  sell5Vat: number;
}