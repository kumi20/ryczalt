export interface Customer{
  customerId: number;
  customerName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  customerVat: string;
  accountNumber: string;
  addressDetails: AddressDetails;
  contactDetails: ContactDetails;
  isSupplier: boolean;
  isRecipient: boolean;
  isOffice: boolean;
}

export interface AddressDetails {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ContactDetails {
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  fax: string;
}

export interface Gus {
  customerName: string;
  customerVat: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
}
