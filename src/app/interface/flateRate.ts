export interface CheckIfMonthIsClosed {
  isClosed: boolean;
}

export interface OpenCloseRequest {
  month: number;
  year: number;
}

export interface FlateRate {
  lp: number;
  dateOfEntry: string;
  dateOfReceipt: string;
  documentNumber: string;
  totalRevenue: number;
  isClose: number;
  rate3: number;
  rate5_5: number;
  rate8_5: number;
  rate10: number;
  rate12: number;
  rate12_5: number;
  rate14: number;
  rate15: number;
  rate17: number;
  remarks: string;
  ryczaltId: number;
}

export interface SummaryMonth {
  sum_rate17: number;
  sum_rate15: number;
  sum_rate14: number;
  sum_rate12_5: number;
  sum_rate12: number;
  sum_rate10: number;
  sum_rate8_5: number;
  sum_rate5_5: number;
  sum_rate3: number;
  total_sum: number;
}
