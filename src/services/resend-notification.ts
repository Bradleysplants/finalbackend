import { TransactionBaseService } from "@medusajs/medusa";
import { readFileSync } from "fs";
import { join } from "path";
import axios from "axios";
import { MedusaError } from "@medusajs/utils";

class ResendNotificationService extends TransactionBaseService {
  protected apiKey_: string;
  protected resendApiUrl_: string;
  protected logger_: any;

  constructor(container) {
    super(container);
    this.apiKey_ = process.env.RESEND_API_KEY;
    this.resendApiUrl_ = "https://api.resend.com/emails"; // Directly using the correct API endpoint
    this.logger_ = container.logger;

    if (!this.apiKey_) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Resend API key not configured");
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
          from: "no-reply@boujee-botanical.store",  // Replace with your actual domain email
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
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Failed to send email");
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `https://yourdomain.com/reset-password?token=${encodeURIComponent(token)}`;
    const htmlContent = this.loadTemplate_("password-reset")
      .replace("{{email}}", email)
      .replace("{{resetLink}}", resetLink)
      .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");

    await this.sendEmail_("Password Reset Request", email, htmlContent);
  }

  async sendOrderCreatedEmail(email: string, orderId: string): Promise<void> {
    const htmlContent = this.loadTemplate_("order-created")
      .replace("{{order_id}}", orderId)
      .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");

    await this.sendEmail_("Order Confirmation", email, htmlContent);
  }

  async sendOrderShippedEmail(email: string, orderId: string): Promise<void> {
    const htmlContent = this.loadTemplate_("order-shipped")
      .replace("{{order_id}}", orderId)
      .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");

    await this.sendEmail_("Your Order Has Shipped", email, htmlContent);
  }

  async sendOrderInvoiceEmail(email: string, orderId: string): Promise<void> {
    const htmlContent = this.loadTemplate_("order-invoice")
      .replace("{{order_id}}", orderId)
      .replace("{{unsubscribeLink}}", "https://yourdomain.com/unsubscribe");

    await this.sendEmail_("Your Invoice", email, htmlContent);
  }
}

export default ResendNotificationService;
