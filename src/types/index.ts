export type RedemptionStatus = 'To Redeem' | 'Redeemed' | 'Expired';

export interface Redemption {
  id: string;
  month: string;
  dateFrom: string;
  dateTo: string;
  name: string;
  perks: string;
  contactNumber: string;
  email: string;
  terms: string;
  redemptionLink: string;
  signUpLink: string;
  notes: string;
  status: RedemptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  breed?: string;
  medicalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceType = 'boarding' | 'daycare' | 'grooming';

export interface ServiceProvider {
  id: string;
  userId: string;
  bio: string;
  serviceTypes: ServiceType[];
  pricing: {
    [key in ServiceType]: number;
  };
  photos: string[];
  location: string;
  isVerified: boolean;
  rating: number;
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  providerId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  providerId: string;
  customerId: string;
  petId: string;
  serviceType: ServiceType;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
} 