import { 
  type SubscriberConfig, 
  type SubscriberArgs,
} from "@medusajs/medusa";
import ResendNotificationService from "../services/resend-notification";

export default async function handleInviteCreated({ 
  data, 
  eventName, 
  container, 
  pluginOptions, 
}: SubscriberArgs<Record<string, string>>) {
  const resendNotificationService: ResendNotificationService = container.resolve("resendNotificationService");

  try {
    await resendNotificationService.sendNotification("invite.created", {
      email: data.user_email,
      token: data.token,
    });
    console.log(`Invitation email sent to ${data.user_email}`);
  } catch (error) {
    console.error(`Failed to send invitation email to ${data.user_email}:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "invite.created",
  context: {
    subscriberId: "invite-created-handler",
  },
};

