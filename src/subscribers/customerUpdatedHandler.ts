import { 
    type SubscriberConfig, 
    type SubscriberArgs,
  } from "@medusajs/medusa";
  import ResendNotificationService from "../services/resend-notification";
  
  const MAX_RETRIES = 3;
  
  export default async function customerUpdatedHandler({
    data,
    eventName,
    container,
  }: SubscriberArgs<{ email: string; first_name: string; last_name: string }>) {
    const resendNotificationService: ResendNotificationService = container.resolve(
      "resendNotificationService"
    );
  
    let attempts = 0;
  
    while (attempts < MAX_RETRIES) {
      try {
        await resendNotificationService.sendNotification("customer.updated", { email: data.email, first_name: data.first_name, last_name: data.last_name });
        console.log(`Customer updated email sent successfully to ${data.email}`);
        break;
      } catch (error) {
        attempts += 1;
        console.error(`Attempt ${attempts} failed to send customer updated email to ${data.email}`, error);
        if (attempts >= MAX_RETRIES) {
          console.error(`Failed to send customer updated email after ${MAX_RETRIES} attempts to ${data.email}`);
        }
      }
    }
  }
  
  export const config: SubscriberConfig = {
    event: "customer.updated",
    context: {
      subscriberId: "customer-updated-handler",
    },
  };
  