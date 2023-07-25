import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
     if (!process.env.NATS_CLIENT_ID) {
          throw new Error("NATS_CLIENT_ID must be defined");
     }
     if (!process.env.NATS_URL) {
          throw new Error("MONGO_URI must be defined");
     }
     if (!process.env.NATS_CLUSTER_ID) {
          throw new Error("MONGO_URI must be defined");
     }

     try {
          await natsWrapper.connect(
               process.env.NATS_CLUSTER_ID,
               process.env.NATS_CLIENT_ID,
               process.env.NATS_URL
          );

          natsWrapper.client.on("close", () => {
               console.log("nats connection closed!");
               process.exit();
          });

          process.on("SIGNINT", () => natsWrapper.client.close());
          process.on("SIGTERM", () => natsWrapper.client.close());

          new OrderCreatedListener(natsWrapper.client).listen();
     } catch (err) {
          console.error(err);
     }
};

start();
