import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

const MAX_RETRIES = 3;

export default async function customerPasswordResetHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ id: string; email: string; first_name: string; last_name: string; token: string }>) {
  const resendService: ResendNotificationService = container.resolve("resendNotificationService");

  // Assuming you have a way to get countryCode, perhaps from an environment variable or configuration
  const countryCode = process.env.COUNTRY_CODE || 'us'; // Default to 'us' if countryCode is not set

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const resetLink = `https://boujee-botanical.store/${countryCode}/password?token=${data.token}`;

      await resendService.sendNotification("customer.password_reset", { 
        email: data.email, 
        first_name: data.first_name, 
        last_name: data.last_name, 
        token: data.token,
        resetLink: resetLink
      });

      console.log(`Customer password reset email sent successfully to ${data.email}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send password reset email to ${data.email}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send password reset email after ${MAX_RETRIES} attempts to ${data.email}`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
    }
  }
}

export const config: SubscriberConfig = {
  event: "customer.password_reset",
  context: {
    subscriberId: "customer-password-reset-handler",
  },
};
