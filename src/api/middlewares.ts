  import { MiddlewaresConfig } from "@medusajs/medusa";
  import { raw } from "body-parser";
  import cors from "cors";
  
  export const config: MiddlewaresConfig = {
    routes: [
      {
        method: ["POST", "PUT"],
        matcher: "/api/webhooks/*",
        bodyParser: false,
        middlewares: [
          cors({
            origin: "*", 
            credentials: true,
          }),
          raw({ type: "application/json" })
        ],
      },
      {
        matcher: "/store/*",
        middlewares: [
          cors({
            origin: "*",
            credentials: true,
          }),
        ],
      },
      {
        matcher: "/admin/*",
        middlewares: [
          cors({
            origin: "*",
            credentials: true,
          }),
        ],
      },
    ],
  };
  