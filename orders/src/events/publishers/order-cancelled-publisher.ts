import { Publisher, Subjects, OrderCancelledEvent } from "@ysticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

}