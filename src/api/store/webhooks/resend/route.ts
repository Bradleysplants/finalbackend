import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  console.log("Received POST request at /api/webhooks/resend");
  console.log("Webhook received:", req.body);
  res.status(200).json({ message: "Webhook received successfully" });
};
