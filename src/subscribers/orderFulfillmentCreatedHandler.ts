import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";
import { CustomerService, OrderService } from "@medusajs/medusa";

const MAX_RETRIES = 3;

export default async function orderFulfillmentCreatedHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ id: string; fulfillment_id: string; no_notification: boolean }>) {
  const resendNotificationService: ResendNotificationService = container.resolve("resendNotificationService");
  const orderService: OrderService = container.resolve("orderService");
  const customerService: CustomerService = container.resolve("customerService");

  let attempts = 0;
  let customerEmail = '';

  while (attempts < MAX_RETRIES) {
    try {
      // Fetch the order information to get the customer ID
      const order = await orderService.retrieve(data.id, {
        select: ["customer_id"],
      });

      if (data.no_notification) {
        console.log('Notification is disabled for this order.');
        return;
      }

      // Use the customer ID from the order to get customer details
      const customer = await customerService.retrieve(order.customer_id, {
        select: ["email"],
      });
      customerEmail = customer.email;

      // Send the notification using the customer's email
      await resendNotificationService.sendNotification("order.fulfillment_created", {
        email: customerEmail,
        order_id: data.id,
      });
      console.log(`Order fulfillment email sent successfully to ${customerEmail}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send fulfillment email to ${customerEmail}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send fulfillment email after ${MAX_RETRIES} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
  context: {
    subscriberId: "order-fulfillment-created-handler",
  },
};
