import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@ysticketing/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payments";

// jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
     await request(app)
          .post("/api/payments")
          .set("Cookie", global.signin())
          .send({
               token: "asdsd",
               orderId: new mongoose.Types.ObjectId().toHexString(),
          })
          .expect(404);
});

it("returns a 401 when purchasing an order that doesnt belong to the user", async () => {
     const order = await Order.build({
          id: new mongoose.Types.ObjectId().toHexString(),
          userId: new mongoose.Types.ObjectId().toHexString(),
          version: 0,
          price: 20,
          status: OrderStatus.Created,
     });

     await order.save();

     await request(app)
          .post("/api/payments")
          .set("Cookie", global.signin())
          .send({
               token: "asdsd",
               orderId: order.id,
          })
          .expect(400);
});

it("returns a 400 when purchasing a cancelled order", async () => {
     const userId = new mongoose.Types.ObjectId().toHexString();

     const order = await Order.build({
          id: new mongoose.Types.ObjectId().toHexString(),
          userId,
          version: 0,
          price: 20,
          status: OrderStatus.Cancelled,
     });

     await order.save();

     await request(app)
          .post("/api/payments")
          .set("Cookie", global.signin())
          .send({ orderId: order.id, token: "asdasd" })
          .expect(400);
});

it("returns a 201 with valid inputs", async () => {
     const userId = new mongoose.Types.ObjectId().toHexString();
     const price = Math.floor(Math.random() * 100000);
     const order = await Order.build({
          id: new mongoose.Types.ObjectId().toHexString(),
          userId,
          version: 0,
          price,
          status: OrderStatus.Created,
     });

     await order.save();

     await request(app)
          .post("/api/payments")
          .set("Cookie", global.signin(userId))
          .send({ token: "tok_visa", orderId: order.id })
          .expect(201);

     const recentCharges = await stripe.charges.list({ limit: 50 });

     const stripeCharge = recentCharges.data.find((charge) => {
          return charge.amount === price * 100;
     });

     expect(stripeCharge).toBeDefined();
     expect(stripeCharge!.currency).toEqual("usd");

     const payment = await Payment.findOne({
          orderId: order.id,
          stripeId: stripeCharge!.id,
     });
     expect(payment).not.toBeNull();
});
