import { 
    type SubscriberConfig, 
    type SubscriberArgs,
  } from "@medusajs/medusa";
  import ResendNotificationService from "../services/resend-notification";
  
  const MAX_RETRIES = 3;
  
  export default async function orderCompletedHandler({
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
        await resendNotificationService.sendNotification("order.completed", { email: data.email, order_id: data.order_id });
        console.log(`Order completed email sent successfully to ${data.email}`);
        break;
      } catch (error) {
        attempts += 1;
        console.error(`Attempt ${attempts} failed to send order completed email to ${data.email}`, error);
        if (attempts >= MAX_RETRIES) {
          console.error(`Failed to send order completed email after ${MAX_RETRIES} attempts to ${data.email}`);
        }
      }
    }
  }
  
  export const config: SubscriberConfig = {
    event: "order.completed",
    context: {
      subscriberId: "order-completed-handler",
    },
  };
  