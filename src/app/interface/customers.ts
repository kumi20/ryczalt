export interface Customer{
  customerId: number;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  customerVat: string;
  accountNumber: string;
  addressDetails: AddressDetails;
  contactDetails: ContactDetails;
}

export interface AddressDetails {
  name: number;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ContactDetails {
  email: string;
  phone: string;
  website: string;
  fax: string;
}
