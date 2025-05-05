export type RedemptionStatus = 'To Redeem' | 'Redeemed' | 'Expired';

export interface Redemption {
  id: string;
  month: string;
  dateFrom: string;
  dateTo: string;
  name: string;
  perks: string;
  contactNumber: string;
  emailAddress: string;
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
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // Optional reference to a redemption ID
} 