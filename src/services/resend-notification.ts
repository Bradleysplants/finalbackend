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

  protected async sendEmail_(subject: string, email: string, htmlContent: string): Promise<void> {
    try {
      const response = await axios.post(
        this.resendApiUrl_,
        {
          from: "no-reply@boujee-botanical.store",
          to: [email],
          subject: subject,
          html: htmlContent,
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
    const { email, subject, htmlContent } = await this.prepareNotificationData(event, data);
    await this.sendEmail_(subject, email, htmlContent);
    return {
      to: email,
      status: "success",
      data: { message: "Notification sent" },
    };
  }

  async resendNotification(notification: any, config: any): Promise<{ to: string; status: string; data: Record<string, unknown>; }> {
    const email = config.to || notification.to;
    await this.sendEmail_(notification.data.subject, email, notification.data.htmlContent);
    return {
      to: email,
      status: "success",
      data: notification.data,
    };
  }

  protected async prepareNotificationData(event: string, data: any) {
    let subject = "";
    let htmlContent = "";
    let email = "";

    this.logger_.info(`Preparing notification for event: ${event}`);

    switch (event) {
      case "order.placed":
        subject = "Order Confirmation";
        email = data.email; 
        htmlContent = this.loadTemplate_("order-placed")
          .replace("{{order_id}}", data.order_id)
          .replace("{{first_name}}", data.first_name);
        break;
      case "user.password_reset":
        subject = "Password Reset Request";
        email = data.email;
        const userResetLink = data.userResetLink;
        htmlContent = this.loadTemplate_("password-reset")
          .replace("{{email}}", email)
          .replace("{{resetLink}}", userResetLink);
        break;
        case "customer.password_reset":
          subject = "Password Reset Request";
          email = data.email;
          const customerResetLink = data.customerResetLink;
          htmlContent = this.loadTemplate_("customer-password-reset")
            .replace("{{email}}", email)
            .replace("{{resetLink}}", customerResetLink);
          break;
      case "order.shipment_created":
        subject = "Your Order Has Shipped";
        email = data.email;
        htmlContent = this.loadTemplate_("order-shipped")
          .replace("{{order_id}}", data.order_id)
          .replace("{{first_name}}", data.first_name);
        break;
      case "invite.created":
        subject = "You're Invited!";
        email = data.email;
        const inviteLink = `https://boujee-botanical.store/invite?token=${encodeURIComponent(data.token)}`;
        htmlContent = this.loadTemplate_("invite-created")
          .replace("{{email}}", email)
          .replace("{{inviteLink}}", inviteLink);
        break;
      case "order.fulfillment_created":
        subject = "Your Order Has Been Fulfilled";
        email = data.email;
        htmlContent = this.loadTemplate_("order-fulfillment")
          .replace("{{email}}", email)
          .replace("{{first_name}}", data.first_name)
          .replace("{{order_id}}", data.order_id);
        break;
      case "customer.created":
        subject = "Welcome to Boujee Botanical Store!";
        email = data.email;
        htmlContent = this.loadTemplate_("customer-created")
          .replace("{{first_name}}", data.first_name)
          .replace("{{last_name}}", data.last_name);
        break;
      default:
        this.logger_.error(`Unhandled notification event: ${event}`);
        throw new Error("Unhandled notification event");
    }

    return { email, subject, htmlContent };
  }
}

export default ResendNotificationService;
