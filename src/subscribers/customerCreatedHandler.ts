import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

const MAX_RETRIES = 3;

export default async function customerCreatedHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ email: string; first_name: string; last_name: string }>) {
  const resendService: ResendNotificationService = container.resolve("resendNotificationService");

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      await resendService.sendNotification("customer.created", {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      console.log(`Customer created email sent successfully to ${data.email}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send customer created email to ${data.email}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send customer created email after ${MAX_RETRIES} attempts to ${data.email}`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
    }
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
  context: {
    subscriberId: "customer-created-handler",
  },
};
