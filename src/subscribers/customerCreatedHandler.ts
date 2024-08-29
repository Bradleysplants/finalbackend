import ResendNotificationService from "../services/resend-notification";
import CustomerService from "@medusajs/medusa/dist/services/customer";

const MAX_RETRIES = 3;

export default async function customerCreatedHandler({
  data,
  eventName,
  container,
}) {
  const resendService = container.resolve("resendNotificationService");
  const customerService = container.resolve("customerService");

  let attempts = 0;

  const customerId = data.id;
  if (!customerId) {
    console.error(`Customer ID is missing in the event data: ${JSON.stringify(data)}`);
    return;
  }

  while (attempts < MAX_RETRIES) {
    try {
      const customer = await customerService.retrieve(customerId);
      console.log(`Retrieved customer: ${customer.email}`);

      await resendService.sendNotification("customer.created", {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      });

      console.log(`Customer created email sent successfully to ${customer.email}`);
      break;
    } catch (error) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed to send customer created email: ${error.message}`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to send customer created email after ${MAX_RETRIES} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

export const config = {
  event: "customer.created",
  context: {
    subscriberId: "customer-created-handler",
  },
};
