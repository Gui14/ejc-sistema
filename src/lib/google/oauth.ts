import { google } from "googleapis";

const driveScopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
];

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} não foi configurada.`);
  }

  return value;
}

export function getOAuth2Client() {
  const clientId = getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = getRequiredEnv(
    "GOOGLE_OAUTH_CLIENT_SECRET",
  );
  const redirectUri = getRequiredEnv(
    "GOOGLE_OAUTH_REDIRECT_URI",
  );

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri,
  );
}

export function getGoogleAuthorizationUrl() {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: driveScopes,
  });
}

export async function exchangeGoogleCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  return tokens;
}

export function getAuthenticatedOAuthClient() {
  const refreshToken = getRequiredEnv(
    "GOOGLE_OAUTH_REFRESH_TOKEN",
  );

  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}