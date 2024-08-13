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

  const { email, token } = data;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      // Send the password reset email
      await resendNotificationService.sendPasswordResetEmail(email, token);
      console.log(`Password reset email sent successfully to ${email}`);
      break; // Exit the loop if successful
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send password reset email to ${email}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send password reset email after ${MAX_RETRIES} attempts to ${email}`);
        // Optionally: handle failure, e.g., log to an external system, notify admin, etc.
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
