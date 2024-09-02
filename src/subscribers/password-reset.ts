import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

const MAX_RETRIES = 3;

export default async function userPasswordResetHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ id: string; email: string; first_name: string; last_name: string; token: string }>) {
  const resendService: ResendNotificationService = container.resolve("resendNotificationService");

  if (!data.token) {
    console.error(`Missing token for user password reset: ${data.email}`);
    return;
  }

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const userResetLink = `https://boujee-botanical.store/password/user-password-reset?token=${encodeURIComponent(data.token)}`;

      await resendService.sendNotification("user.password_reset", { 
        email: data.email, 
        first_name: data.first_name, 
        last_name: data.last_name, 
        token: data.token,
        userResetLink: userResetLink // Ensure the key matches the placeholder in the template
      });

      console.log(`User password reset email sent successfully to ${data.email}`);
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
  event: "user.password_reset",
  context: {
    subscriberId: "user-password-reset-handler",
  },
};
