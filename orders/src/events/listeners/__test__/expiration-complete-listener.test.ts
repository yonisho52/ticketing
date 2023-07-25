import { OrderStatus, ExpirationCompleteEvent } from "@ysticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from "../../../models/order";

const setup = async () => {
     const listener = new ExpirationCompleteListener(natsWrapper.client);

     const ticket = await Ticket.build({
          id: new mongoose.Types.ObjectId().toHexString(),
          title: "concert",
          price: 20,
     });

     await ticket.save();

     const order = Order.build({
          status: OrderStatus.Created,
          userId: "asdasd",
          expiresAt: new Date(),
          ticket,
     });

     await order.save();

     const data: ExpirationCompleteEvent["data"] = {
          orderId: order.id,
     };

     // @ts-ignore
     const msg: Message = {
          ack: jest.fn(),
     };

     return { msg, data, ticket, listener, order };
};

it("updates the order status to cancelled", async () => {
     const { msg, data, ticket, listener, order } = await setup();

     await listener.onMessage(data, msg);

     const updatedOrder = await Order.findById(order.id);

     expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an order canceeled event", async () => {
     const { msg, data, ticket, listener, order } = await setup();

     await listener.onMessage(data, msg);

     expect(natsWrapper.client.publish).toHaveBeenCalled();

     const eventData = JSON.parse(
          (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
     );

     expect(eventData.id).toEqual(order.id);
});

it("act the message", async () => {
     const { msg, data, ticket, listener, order } = await setup();

     await listener.onMessage(data, msg);

     try {
          await listener.onMessage(data, msg);
     } catch (err) {}

     expect(msg.ack).toHaveBeenCalled();
});
