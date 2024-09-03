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

  if (!data.token) {
    console.error(`Missing token for customer password reset: ${data.email}`);
    return;
  }

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      // Encode the token into Base64
      const encodedToken = Buffer.from(data.token).toString('base64');
      const customerResetLink = `https://boujee-botanical.store/password?token=${encodeURIComponent(encodedToken)}`;

      await resendService.sendNotification("customer.password_reset", { 
        email: data.email, 
        first_name: data.first_name, 
        last_name: data.last_name, 
        customerResetLink: customerResetLink // Send the encoded link directly
      });

      console.log(`Customer password reset email sent successfully to ${data.email}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send password reset email to ${data.email}`, error);

      // Optional: Add more specific error handling here if needed

      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send password reset email after ${MAX_RETRIES} attempts to ${data.email}`);
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // Optional: Adjust delay if needed
    }
  }
}

export const config: SubscriberConfig = {
  event: "customer.password_reset",
  context: {
    subscriberId: "customer-password-reset-handler",
  },
};
