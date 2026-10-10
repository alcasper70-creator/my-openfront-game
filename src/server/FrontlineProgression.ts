import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "frontline-frenzy";
const issuer = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const firebaseKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

const ProfileSchema = z.object({
  firebase_uid: z.string(),
  username: z.string(),
  credits: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
});

export type FrontlineProfile = z.infer<typeof ProfileSchema>;

function supabaseConfig(): { url: string; secret: string } | null {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && secret ? { url, secret } : null;
}

async function firebaseIdentity(token: string): Promise<{ uid: string; name: string }> {
  const { payload } = await jwtVerify(token, firebaseKeys, {
    audience: FIREBASE_PROJECT_ID,
    issuer,
  });
  if (typeof payload.sub !== "string" || !payload.sub) throw new Error("Missing Firebase user id");
  return {
    uid: payload.sub,
    name: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim().slice(0, 32) : "Commander",
  };
}

/**
 * Returns a persistent progression profile. The service-role key is used only
 * in this server process; browsers authenticate with a Firebase ID token.
 */
export async function getFrontlineProfile(idToken: string): Promise<FrontlineProfile> {
  const config = supabaseConfig();
  if (!config) throw new Error("Progression is not configured");
  const identity = await firebaseIdentity(idToken);
  const response = await fetch(`${config.url}/rest/v1/player_profiles?on_conflict=firebase_uid`, {
    method: "POST",
    headers: {
      apikey: config.secret,
      Authorization: `Bearer ${config.secret}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ firebase_uid: identity.uid, username: identity.name }),
  });
  if (!response.ok) throw new Error(`Supabase profile request failed (${response.status})`);
  const rows = ProfileSchema.array().safeParse(await response.json());
  if (!rows.success || !rows.data[0]) throw new Error("Invalid progression profile response");
  return rows.data[0];
}
