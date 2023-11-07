import crypto from "crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";

async function main() {
  const username = process.argv[2];
  if (!username) {
    throw new Error("No username specified");
  }
  console.log(`Resetting '${username}' password`);

  const generatedPassword = crypto.randomBytes(16).toString("hex");
  const newPassword = await bcrypt.hash(generatedPassword, 10);
  await db
    .update(users)
    .set({ password: newPassword })
    .where(eq(users.username, username));

  console.log(`New password: ${generatedPassword}`);
}

main()
  .then(() => console.log("Success"))
  .catch(console.error);
