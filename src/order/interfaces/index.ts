export interface IPaymentDetails {
  sessionUrl?: string;
  sessionId?: string;
  finalTotal: number;
  gateway?: 'stripe' | 'paymob';
  status?: string;
  expiresAt?: Date;
  receiptUrl?: string;
  stripePaymentIntentId?: string;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}
