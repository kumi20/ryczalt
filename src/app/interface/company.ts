export interface Company {
  id: number;
  name: string;
  nip: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  is_active: boolean;
  isVatPayer: boolean;
  isFPPayer: boolean;
  isHealthInsurance: boolean;
  isSocialInsurance: boolean;
  isSicknessInsurance: boolean;
  ID_URZAD_SKARBOWY: number;
}
