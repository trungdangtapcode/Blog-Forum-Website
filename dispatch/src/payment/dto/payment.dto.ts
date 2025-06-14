import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateCreditPurchaseDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  creditAmount: number;
}

export class PaymentCallbackDto {
  @IsNotEmpty()
  orderId: string;
  
  @IsNotEmpty()
  resultCode: number;
  
  amount: number;
  transId: number;
  message: string;
  responseTime: number;
  signature: string;
}
