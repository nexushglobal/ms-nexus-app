export interface MembershipSubscriptionData {
  id: number;
  planName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  created: Date;
  note:string;
}

export interface PaymentReportData {
  paymentAmount: number;
  paymentType: string;
  firstName: string;
  lastName: string;
  email: string;
  created: Date;
  paymentMethod: string;
}

export interface UserRegistrationData {
  name: string;
  lastname: string;
  email: string;
  phone: string;
  age: number;
  document: string;
  typedocument: string;
  createdAt: Date;
}