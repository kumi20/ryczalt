export interface Office {
  officeId: number;          // ID urzędu
  name: string;              // Nazwa urzędu
  street: string;            // Ulica
  city: string;              // Miasto
  postalCode: string;        // Kod pocztowy
  countryId: number;         // ID kraju
  nip: string;              // NIP urzędu
  email: string;            // Email
  phone: string;            // Telefon
  accountNumber: string;     // Numer konta bankowego
  isActive: boolean;         // Czy aktywny
  isSystem: boolean;         // Czy systemowy
  type: OfficeType;         // Typ urzędu
}

export enum OfficeType {
  TaxOffice = 1,            // Urząd skarbowy
  SocialInsurance = 2,      // ZUS
  CityHall = 3,            // Urząd miasta/gminy
  Other = 4                 // Inny
}

export interface OfficeResponse {
  data: Office[];           // Lista urzędów
  totalCount: number;       // Całkowita liczba rekordów
}

export interface OfficeRequest {
  pageSize?: number;        // Rozmiar strony
  pageNumber?: number;      // Numer strony
  searchPhrase?: string;    // Fraza wyszukiwania
  sortField?: string;       // Pole sortowania
  sortOrder?: 'asc' | 'desc'; // Kierunek sortowania
  type?: OfficeType;        // Filtrowanie po typie urzędu
}
