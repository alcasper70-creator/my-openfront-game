import { firebaseIdentity, supabaseConfig } from "./FrontlineProgression";

type ClanRow = { id: string; tag: string; name: string; owner_uid: string; created_at: string };

function headers(secret: string): HeadersInit {
  return { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
}

export async function listFrontlineClans(): Promise<ClanRow[]> {
  const config = supabaseConfig();
  if (!config) throw new Error("Clan database is not configured");
  const response = await fetch(`${config.url}/rest/v1/frontline_clans?select=id,tag,name,owner_uid,created_at&order=created_at.desc`, { headers: headers(config.secret) });
  if (!response.ok) throw new Error(`Clan list failed (${response.status})`);
  return await response.json() as ClanRow[];
}

export async function createFrontlineClan(token: string, rawTag: string, rawName: string): Promise<ClanRow> {
  const config = supabaseConfig();
  if (!config) throw new Error("Clan database is not configured");
  const identity = await firebaseIdentity(token);
  const tag = rawTag.trim().toUpperCase();
  const name = rawName.trim();
  if (!/^[A-Z0-9]{2,6}$/.test(tag)) throw new Error("Clan tag must be 2-6 letters or numbers");
  if (name.length < 3 || name.length > 32) throw new Error("Clan name must be 3-32 characters");
  const response = await fetch(`${config.url}/rest/v1/frontline_clans`, { method: "POST", headers: { ...headers(config.secret), Prefer: "return=representation" }, body: JSON.stringify({ tag, name, owner_uid: identity.uid }) });
  if (!response.ok) throw new Error(`Clan creation failed (${response.status})`);
  const [clan] = await response.json() as ClanRow[];
  await fetch(`${config.url}/rest/v1/frontline_clan_members`, { method: "POST", headers: headers(config.secret), body: JSON.stringify({ clan_id: clan.id, firebase_uid: identity.uid, username: identity.name, role: "owner" }) });
  return clan;
}

export async function joinFrontlineClan(token: string, clanId: string): Promise<void> {
  const config = supabaseConfig();
  if (!config) throw new Error("Clan database is not configured");
  const identity = await firebaseIdentity(token);
  const response = await fetch(`${config.url}/rest/v1/frontline_clan_members`, { method: "POST", headers: headers(config.secret), body: JSON.stringify({ clan_id: clanId, firebase_uid: identity.uid, username: identity.name, role: "member" }) });
  if (!response.ok) throw new Error(`Clan join failed (${response.status})`);
}
