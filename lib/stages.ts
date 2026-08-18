import type { OpportunityStage } from "./database.types";

export const STAGES: { value: OpportunityStage; color: string }[] = [
  { value: "New lead", color: "var(--stage-new)" },
  { value: "Contacted", color: "var(--stage-contacted)" },
  { value: "Qualified", color: "var(--stage-qualified)" },
  { value: "Proposal Sent", color: "var(--stage-proposal)" },
  { value: "Won", color: "var(--stage-won)" },
  { value: "Lost", color: "var(--stage-lost)" },
];

export const STAGE_COLOR: Record<OpportunityStage, string> = Object.fromEntries(
  STAGES.map((s) => [s.value, s.color])
) as Record<OpportunityStage, string>;
