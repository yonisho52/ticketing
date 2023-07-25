import { OrderStatus } from "@ysticketing/common";
import mongoose from "mongoose";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttrs {
     userId: string;
     status: OrderStatus;
     expiresAt: Date;
     ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
     userId: string;
     status: OrderStatus;
     expiresAt: Date;
     ticket: TicketDoc;
     version: number;
}

interface orderModel extends mongoose.Model<OrderDoc> {
     build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
     {
          userId: { type: String, require: true },
          status: {
               type: String,
               require: true,
               enum: Object.values(OrderStatus),
               default: OrderStatus.Created,
          },
          expiresAt: { type: mongoose.Schema.Types.Date },
          ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
     },
     {
          toJSON: {
               transform(doc, ret) {
                    ret.id = ret._id;
                    delete ret._id;
               },
          },
     }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
     return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, orderModel>("Order", orderSchema);

export { Order, OrderStatus };
