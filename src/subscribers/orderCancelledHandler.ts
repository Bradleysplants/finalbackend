import { 
    type SubscriberConfig, 
    type SubscriberArgs,
  } from "@medusajs/medusa";
  import ResendNotificationService from "../services/resend-notification";
  
  const MAX_RETRIES = 3;
  
  export default async function orderCancelledHandler({
    data,
    eventName,
    container,
  }: SubscriberArgs<{ email: string; order_id: string }>) {
    const resendNotificationService: ResendNotificationService = container.resolve(
      "resendNotificationService"
    );
  
    let attempts = 0;
  
    while (attempts < MAX_RETRIES) {
      try {
        await resendNotificationService.sendNotification("order.cancelled", { email: data.email, order_id: data.order_id });
        console.log(`Order cancelled email sent successfully to ${data.email}`);
        break;
      } catch (error) {
        attempts += 1;
        console.error(`Attempt ${attempts} failed to send order cancelled email to ${data.email}`, error);
        if (attempts >= MAX_RETRIES) {
          console.error(`Failed to send order cancelled email after ${MAX_RETRIES} attempts to ${data.email}`);
        }
      }
    }
  }
  
  export const config: SubscriberConfig = {
    event: "order.cancelled",
    context: {
      subscriberId: "order-cancelled-handler",
    },
  };
  