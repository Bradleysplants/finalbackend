import { AbstractNotificationService } from "@medusajs/medusa";
import { readFileSync } from "fs";
import { resolve } from "path";
import axios from "axios";

class ResendNotificationService extends AbstractNotificationService {
  static identifier = "resend-notification";
  protected apiKey_: string;
  protected resendApiUrl_: string;
  protected logger_: any;

  constructor(container) {
    super(container);
    this.apiKey_ = process.env.RESEND_API_KEY;
    this.resendApiUrl_ = "https://api.resend.com/emails";
    this.logger_ = container.logger;

    if (!this.apiKey_) {
      throw new Error("Resend API key not configured");
    }
  }

  protected loadTemplate_(templateName: string): string {
    const templatePath = resolve(__dirname, "..", "templates", `${templateName}.html`);
    return readFileSync(templatePath, "utf-8");
  }

  protected async sendEmail_(subject: string, email: string, textContent: string): Promise<void> {
    try {
      const response = await axios.post(
        this.resendApiUrl_,
        {
          from: "no-reply@boujee-botanical.store",
          to: [email],
          subject: subject,
          text: textContent, // Use 'text' instead of 'html'
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey_}`,
            "Content-Type": "application/json",
          },
        }
      );
      this.logger_.info(`Resend response: ${response.status} - ${JSON.stringify(response.data)}`);
      this.logger_.info(`Email sent successfully to ${email}: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger_.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendNotification(event: string, data: any): Promise<{ to: string; status: string; data: Record<string, unknown>; }> {
    const { email, subject, textContent } = await this.prepareNotificationData(event, data);
    await this.sendEmail_(subject, email, textContent);
    return {
      to: email,
      status: "success",
      data: { message: "Notification sent" },
    };
  }

  async resendNotification(notification: any, config: any): Promise<{ to: string; status: string; data: Record<string, unknown>; }> {
    const email = config.to || notification.to;
    await this.sendEmail_(notification.data.subject, email, notification.data.textContent);
    return {
      to: email,
      status: "success",
      data: notification.data,
    };
  }

  protected async prepareNotificationData(event: string, data: any) {
    let subject = "";
    let textContent = "";
    let email = "";

    this.logger_.info(`Preparing notification for event: ${event}`);

    switch (event) {
      case "order.placed":
        subject = "Order Confirmation";
        email = data.email;
        textContent = `Dear ${data.first_name},\n\nThank you for your order! Your order ID is ${data.order_id}.\n\nBest regards,\nBoujee Botanical Store`;
        break;
      case "user.password_reset":
        subject = "Password Reset Request";
        email = data.email;
        const userResetLink = `https://boujee-botanical.store/password/user-password-reset?token=${encodeURIComponent(data.token)}`;
        textContent = `Dear ${data.first_name},\n\nYou requested a password reset. Please click the link below to reset your password:\n${userResetLink}\n\nIf you didn't request this, please ignore this email.`;
        break;
      case "customer.password_reset":
        subject = "Password Reset Request";
        email = data.email;
        const customerResetLink = `https://boujee-botanical.store/password?token=${encodeURIComponent(data.token)}`;
        textContent = `Dear ${data.first_name},\n\nYou requested a password reset. Please click the link below to reset your password:\n${customerResetLink}\n\nIf you didn't request this, please ignore this email.`;
        break;
      case "order.shipment_created":
        subject = "Your Order Has Shipped";
        email = data.email;
        textContent = `Dear ${data.first_name},\n\nYour order has shipped! Your order ID is ${data.order_id}.\n\nBest regards,\nBoujee Botanical Store`;
        break;
      case "invite.created":
        subject = "You're Invited!";
        email = data.email;
        const inviteLink = `https://boujee-botanical.store/invite?token=${encodeURIComponent(data.token)}`;
        textContent = `Dear ${data.first_name},\n\nYou have been invited to join the Boujee Botanical Store. Please click the link below to accept the invitation:\n${inviteLink}`;
        break;
      case "order.fulfillment_created":
        subject = "Your Order Has Been Fulfilled";
        email = data.email;
        textContent = `Dear ${data.first_name},\n\nYour order has been fulfilled! Your order ID is ${data.order_id}.\n\nBest regards,\nBoujee Botanical Store`;
        break;
      case "customer.created":
        subject = "Welcome to Boujee Botanical Store!";
        email = data.email;
        textContent = `Dear ${data.first_name},\n\nWelcome to Boujee Botanical Store! We are glad to have you.\n\nBest regards,\nBoujee Botanical Store`;
        break;
      default:
        this.logger_.error(`Unhandled notification event: ${event}`);
        throw new Error("Unhandled notification event");
    }

    return { email, subject, textContent };
  }
}

export default ResendNotificationService;
