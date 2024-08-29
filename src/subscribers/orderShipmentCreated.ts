import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";
import { CustomerService, OrderService } from "@medusajs/medusa";

const MAX_RETRIES = 3;

export default async function orderShipmentCreatedHandler({
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
        relations: ["customer"],
      });

      if (!order || !order.customer_id) {
        throw new Error(`Order or customer not found for order ID: ${data.id}`);
      }

      // Use the customer ID from the order to get customer details
      const customer = await customerService.retrieve(order.customer_id);

      if (!customer || typeof customer.email !== 'string') {
        throw new Error(`Customer not found or missing email for customer ID: ${order.customer_id}`);
      }

      customerEmail = customer.email;

      if (data.no_notification) {
        console.log('Notification is disabled for this order.');
        return;
      }

      // Use sendNotification to handle sending the order shipment email
      await resendNotificationService.sendNotification("order.shipment_created", {
        email: customerEmail,
        order_id: data.id,
        fulfillment_id: data.fulfillment_id, // Include the fulfillment ID if needed in the email template
      });

      console.log(`Order shipment email sent successfully to ${customerEmail}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send order shipment email to ${customerEmail || 'unknown email'}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send order shipment email after ${MAX_RETRIES} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.shipment_created",
  context: {
    subscriberId: "order-shipment-created-handler",
  },
};
