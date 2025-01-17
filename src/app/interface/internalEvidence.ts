export interface InternalEvidence {
  internalEvidenceId: number;
  isCoast: boolean;
  documentNumber: string;
  documentDate: string;
  description: string;
  amount: number;
  price: number;
  unit: string;
  personIssuing: string;
  taxVat: string;
  remarks: string;
  companyId: number;
  userInsert: number;
  dateInsert: string;
  userUpdate: number;
  dateUpdate: string;
  isBooked: boolean;
  isClosed: boolean;
}
