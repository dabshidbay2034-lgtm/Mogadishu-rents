export type PropertyType = "house" | "apartment" | "hotel" | "commercial";

export type UserRole = "user" | "owner" | "hotel_manager" | "agent" | "admin" | "semi_admin";

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  deposit: number;
  location: string;
  images: string[];
  owner_id: string;
  created_at: string;
  is_available: boolean;
  // House specific
  bedrooms?: number;
  living_rooms?: number;
  kitchens?: number;
  toilets?: number;
  has_cctv?: boolean;
  has_parking?: boolean;
  // Apartment specific
  floor_number?: number;
  has_balcony?: boolean;
  // Hotel specific (price is per night)
  is_daily_rate?: boolean;
  is_furnished?: boolean;
  // Universal amenity
  has_elevator?: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  is_verified?: boolean;
}
