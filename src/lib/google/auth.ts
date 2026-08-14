import { google } from "googleapis";

function getPrivateKey() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY não foi configurada.",
    );
  }

  return privateKey.replace(/\\n/g, "\n");
}

export function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!clientEmail) {
    throw new Error(
      "GOOGLE_CLIENT_EMAIL não foi configurado.",
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: getPrivateKey(),
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}