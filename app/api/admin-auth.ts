import { getChatGPTUser } from "../chatgpt-auth";
import { findAdvisorByToken } from "../../db/advisors";

export async function requireAdminRequest(request: Request) {
  const host = new URL(request.url).hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return { userId: "local-admin", email: "vista@local" };
  }
  return getChatGPTUser();
}

export async function resolveLinkActor(request: Request) {
  const advisorToken = request.headers.get("x-advisor-token")?.trim();
  if (advisorToken) {
    const advisor = await findAdvisorByToken(advisorToken);
    return advisor ? { kind:"advisor" as const, userId:`advisor:${advisor.id}`, advisor } : null;
  }
  const admin = await requireAdminRequest(request);
  return admin ? { kind:"admin" as const, userId:admin.userId, advisor:null } : null;
}
