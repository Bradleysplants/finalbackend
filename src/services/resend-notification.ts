import { AbstractNotificationService } from "@medusajs/medusa";
import { readFileSync } from "fs";
import { join } from "path";
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
    const templatePath = join(__dirname, "..", "templates", `${templateName}.html`);
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
    const { email, subject, htmlContent } = this.prepareNotificationData(event, data);
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

  protected prepareNotificationData(event: string, data: any) {
    let subject = "";
    let htmlContent = "";
    const email = data.email;

    switch (event) {
      case "order.placed":
        subject = "Order Confirmation";
        htmlContent = this.loadTemplate_("order-created")
          .replace("{{order_id}}", data.orderId)
          .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");
        break;
      case "user.password_reset":
        subject = "Password Reset Request";
        const resetLink = `https://yourdomain.com/reset-password?token=${encodeURIComponent(data.token)}`;
        htmlContent = this.loadTemplate_("password-reset")
          .replace("{{email}}", email)
          .replace("{{resetLink}}", resetLink)
          .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");
        break;
      case "order.shipment_created":
        subject = "Your Order Has Shipped";
        htmlContent = this.loadTemplate_("order-shipped")
          .replace("{{order_id}}", data.orderId)
          .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");
        break;
      case "order.invoice_created":
        subject = "Your Invoice";
        htmlContent = this.loadTemplate_("order-invoice")
          .replace("{{order_id}}", data.orderId)
          .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");
        break;
      default:
        throw new Error("Unhandled notification event");
    }

    return { email, subject, htmlContent };
  }
}

export default ResendNotificationService;
