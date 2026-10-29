export const jwtConfig = {
  secret: process.env.JWT_SECRET || "dev_secret",
  expiresIn: "1h"
};
