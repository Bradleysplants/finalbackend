import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

const MAX_RETRIES = 3;

export default async function orderCreatedHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ orderId: string; email: string }>) {
  const resendNotificationService: ResendNotificationService = container.resolve(
    "resendNotificationService"
  );

  const { orderId, email } = data;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      // Send the order created email
      await resendNotificationService.sendOrderCreatedEmail(orderId, email);
      console.log(`Order created email sent successfully for order ID: ${orderId}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send order created email for order ID: ${orderId}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send order created email after ${MAX_RETRIES} attempts for order ID: ${orderId}`);
        // Optionally: handle failure, e.g., log to an external system, notify admin, etc.
      }
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: {
    subscriberId: "order-created-handler",
  },
};
