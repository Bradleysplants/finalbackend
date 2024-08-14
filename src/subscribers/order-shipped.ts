import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

const MAX_RETRIES = 3;

export default async function orderShippedHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ orderId: string; email: string }>) {
  const resendNotificationService: ResendNotificationService = container.resolve(
    "resendNotificationService"
  );

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      // Use sendNotification to handle sending the shipped email
      await resendNotificationService.sendNotification("order.shipment_created", { orderId: data.orderId, email: data.email });
      console.log(`Order shipped email sent successfully for order ID: ${data.orderId}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send order shipped email for order ID: ${data.orderId}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send order shipped email after ${MAX_RETRIES} attempts for order ID: ${data.orderId}`);
        // Optionally: handle failure, e.g., log to an external system, notify admin, etc.
      }
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.shipment_created",
  context: {
    subscriberId: "order-shipped-handler",
  },
};
