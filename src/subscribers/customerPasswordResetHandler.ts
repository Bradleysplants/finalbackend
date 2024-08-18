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
  }: SubscriberArgs<{ email: string; token: string }>) {
    const resendNotificationService: ResendNotificationService = container.resolve(
      "resendNotificationService"
    );
  
    let attempts = 0;
  
    while (attempts < MAX_RETRIES) {
      try {
        await resendNotificationService.sendNotification("customer.password_reset", { email: data.email, token: data.token });
        console.log(`Password reset email sent successfully to ${data.email}`);
        break;
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
    event: "customer.password_reset",
    context: {
      subscriberId: "customer-password-reset-handler",
    },
  };
  