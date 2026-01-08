export type CarType =
  | "pequeno"
  | "medio"
  | "grande"
  | "suv"
  | "carrinha"
  | "luxo"
  | "estate"
  | "premium"
  | "carrier";
export type TransmissionType = "manual" | "automatico";
export type LocationType = "terminal" | "shuttle" | "train" | "others";

export interface Car {
  id: string;
  distanceString?: string;
  availableFor: "rental" | "transfer" | "both"; // Disponibilidade do veículo
  name: string;
  type: CarType;
  transmission: TransmissionType;
  seats: number;
  price: number;
  image: string;
  pricePerKm?: number; // Preço por Km específico do carro (para transfers)
  badges?: string[];
  locationType: LocationType;
  supplier: string;
  hasAC: boolean;
  mileage: "limited" | "unlimited";
  fuelPolicy: "like" | "full-to-empty";
  score: number;
  deposit: number;
  luggage: string;
  extras?: string[];
  locationName?: string;
  distanceFromCentre?: string;
  supplierLogo?: string;
  originalPrice?: number;
  supplierRating?: number;
  supplierReviewCount?: number;
  insurance?: {
    excess: number;
    theftExcess: number;
    collisionDamageWaiver: boolean;
    dailyPrice?: number;
  };
  includedServices?: string[];
  serviceTypes?: string[];
  isRecommendedForMultiple?: boolean;
  capacityInfo?: {
    seats: number;
    luggage: number;
  };
}

export interface SearchFilters {
  type?: "rental" | "transfer";
  pickup?: string;
  dropoff?: string; // Destino para cálculo de transfers
  passengers?: string | number; // Número de passageiros (para transfers)
  luggage?: string | number; // Número de malas (para transfers)
  categories?: string[];
  sortBy?: string;
  loc?: string[];
  sup?: string[];
  spec?: string[];
  pol?: string[];
  trans?: string[];
  mileage?: string[];
  extras?: string[];
  price_range?: string[];
  seats?: string[];
  score?: string[];
  pay?: string[];
  electric?: string[];
  fuel?: string[];
  deposit?: string[];
  limit?: number;
  offset?: number;
}

export interface Supplier {
  id: string;
  name: string;
  logo?: string;
}

export interface SearchResponse {
  results: Car[];
  totalCount: number;
  facets: Record<string, Record<string, number>>;
  suppliers: Supplier[];
  recommendationInfo?: {
    needsMultiple: boolean;
    totalPassengers: number;
    totalLuggage: number;
    vehiclesNeeded: number;
    maxSeatsPerVehicle: number;
    maxLuggagePerVehicle: number;
    message: string;
  };
}
