import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

const MAX_RETRIES = 3;

export default async function passwordResetHandler({
  data,
  eventName,
  container,
}: SubscriberArgs<{ email: string; token: string }>) {
  const resendNotificationService: ResendNotificationService = container.resolve(
    "resendNotificationService"
  );

  const resetLink = `https://boujee-botanical.store/password?token=${data.token}`;

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      // Use sendNotification to handle sending the password reset email
      await resendNotificationService.sendNotification("user.password_reset", { 
        email: data.email, 
        reset_link: resetLink 
      });
      console.log(`Password reset email sent successfully to ${data.email}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send password reset email to ${data.email}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send password reset email after ${MAX_RETRIES} attempts to ${data.email}`);
      }
    }
  }
}

export const config: SubscriberConfig = {
  event: "user.password_reset",
  context: {
    subscriberId: "password-reset-handler",
  },
};
