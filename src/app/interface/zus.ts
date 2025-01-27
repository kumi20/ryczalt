export interface Zus {
  id: number;
  year: number;
  base: string;
  social: string;
  social_u: string;
  sickness: string;
  sickness_u: string;
  previousMonthSocial: string;
  totalIncome: string;
  FGSP: string;
}



export interface OpenCloseZusRequest {
  month: number;
  year: number;
}

export interface ZusStatusResponse {
  isClosed: boolean;
  isBooked: boolean;
}

export interface ContributionsZUS {
  contributionsZUSId: number;
  month: number;
  year: number;
  isContributionHolidays: boolean;
  social: string;
  isSocialPaid: boolean;
  dateSocialPaid: Date;
  contributionHealth: string;
  isHealthPaid: boolean;
  dateHealthPaid: Date;
  fpfgsw: string;
  isFpfgswPaid: boolean;
  dateFpfgswPaid: Date;
  fp: string;
  isFpPaid: boolean;
  dateFpPaid: Date;
}

export interface ContributionsZUSResponse {
  data: ContributionsZUS[];
}
