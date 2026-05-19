export type Address = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
};

export type Company = {
  id: string;
  name: string;
  address: Address;
};

export type BusinessCardFormData = {
  vorname: string;
  nachname: string;
  wunschposition: string;
  abteilung: string;
  telefonnummer: string;
  mobilnummer: string;
  email: string;
  firmaId: string;
};

export type SupportedLocale = "de" | "en";