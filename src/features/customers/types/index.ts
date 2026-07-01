export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PetRecord {
  id: string;
  customerId: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string | null;
  weightKg: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomerPayload {
  name: string;
  phone: string;
  email?: string;
}

export interface PetPayload {
  customerId: string;
  name: string;
  species: string;
  breed: string;
  birthDate?: string;
  weightKg: number;
}
