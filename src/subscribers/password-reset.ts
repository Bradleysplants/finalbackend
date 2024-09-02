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

  // Verify that the token is properly generated and passed
  if (!data.token) {
    console.error("Token is missing or undefined");
    return;
  }

  // Use environment variable for base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:8000';
  const resetLink = `${baseUrl}/password?token=${encodeURIComponent(data.token)}`;

  // Log the reset link to verify
  console.log(`Reset link: ${resetLink}`);

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
