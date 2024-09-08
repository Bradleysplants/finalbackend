import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

const MAX_RETRIES = 3;

export default async function orderShipmentCreatedHandler({
  data,
  eventName, 
  container,
}: SubscriberArgs<{ order_id: string; email: string; }>) {
  const resendService: ResendNotificationService = container.resolve("resendNotificationService");
  const orderService = container.resolve("orderService");
  const customerService = container.resolve("customerService");

  try {
    // Fetch order information (if needed)
    const order = await orderService.retrieve(data.order_id, { relations: ["customer"] });
    
    // Fetch customer information from CustomerService
    const customer = await customerService.retrieve(order.customer_id);

    // Extract customer first name
    const firstName = customer.first_name;

    const orderShipmentLink = `https://boujee-botanical.store/account/orders/${data.order_id}`;

    // Send the email with the first name and order shipment details
    await resendService.sendNotification("order.shipment_created", { 
      email: data.email, 
      first_name: firstName, 
      order_id: data.order_id, 
      orderShipmentLink: orderShipmentLink
    });

    console.log(`Shipment email sent successfully to ${data.email}`);
  } catch (error) {
    console.error(`Failed to send shipment email to ${data.email}`, error);
  }
}

export const config: SubscriberConfig = {
  event: "order.shipment_created",
  context: {
    subscriberId: "order-shipment-created-handler",
  },
};
