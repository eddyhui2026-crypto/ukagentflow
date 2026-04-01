export type AgentFollowUp = "new" | "called" | "followed_up";

const ALLOWED = new Set<AgentFollowUp>(["new", "called", "followed_up"]);

export function parseAgentFollowUp(raw: string | null | undefined): AgentFollowUp | null {
  const s = String(raw ?? "").trim() as AgentFollowUp;
  return ALLOWED.has(s) ? s : null;
}

export const AGENT_FOLLOW_UP_LABELS: Record<AgentFollowUp, string> = {
  new: "New",
  called: "Called",
  followed_up: "Followed up",
};
