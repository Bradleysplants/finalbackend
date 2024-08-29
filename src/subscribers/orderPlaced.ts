import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";
import { CustomerService, OrderService } from "@medusajs/medusa";

const MAX_RETRIES = 3;

export default async function orderPlacedHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ id: string; no_notification: boolean }>) {
  const resendNotificationService: ResendNotificationService = container.resolve("resendNotificationService");
  const orderService: OrderService = container.resolve("orderService");
  const customerService: CustomerService = container.resolve("customerService");

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      // Fetch the order information to get the customer's email
      const order = await orderService.retrieve(data.id, {
        relations: ["customer"],
      });
      
      if (data.no_notification) {
        console.log('Notification is disabled for this order.');
        return;
      }

      // Send the notification using the customer's email
      await resendNotificationService.sendNotification("order.placed", {
        email: order.customer.email,
        orderId: data.id,
      });
      console.log(`Order placed email sent successfully to ${order.customer.email}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send order placed email`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send order placed email after ${MAX_RETRIES} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: {
    subscriberId: "order-placed-handler",
  },
};
