/**
 * Response type from payment service createPayment method
 */
export interface PaymentResponse {
  success: boolean;
  paymentId: number;
  pointsTransactionId?: number;
  message?: string;
  remainingPoints?: number;
  orderInfo?: {
    orderId: number;
    status: string;
    autoApproved: boolean;
  };
}
