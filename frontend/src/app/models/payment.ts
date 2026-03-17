import { Delete, PaymentStatus, PaymentType } from "../utils/util.model";
import { Student } from "./student";

export class Payment {
  constructor(
    id: string,
    amount: number,
    date: Date,
    type: PaymentType,
    status: PaymentStatus,
    file: string,
    student: Student,
    isDeleted: Delete
  ) {}

}
