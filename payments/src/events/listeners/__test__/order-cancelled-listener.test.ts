import { OrderStatus, OrderCancelledEvent } from "@ysticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
     const listener = new OrderCancelledListener(natsWrapper.client);

     const order = Order.build({
          id: new mongoose.Types.ObjectId().toHexString(),
          status: OrderStatus.Created,
          price: 10,
          userId: "asdasdda",
          version: 0,
     });
     await order.save();

     const data: OrderCancelledEvent["data"] = {
          id: order.id,
          version: 1,
          ticket: {
               id: "dfgdfg",
          },
     };

     // @ts-ignore
     const msg: Message = {
          ack: jest.fn(),
     };

     return { listener, order, data, msg };
};

it("update the status of the order", async () => {
     const { listener, order, data, msg } = await setup();
     await listener.onMessage(data, msg);

     const updateOrder = await Order.findById(order.id);

     expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message ", async () => {
     const { listener, order, data, msg } = await setup();
     await listener.onMessage(data, msg);

     expect(msg.ack).toHaveBeenCalled();
});
