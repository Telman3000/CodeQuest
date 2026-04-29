export type SessionMode = "guest" | "signed" | null;

export type Mission = {
  id: string;
  title: string;
  rationale: string;
  difficulty: "easy" | "medium" | "hard";
  etaMinutes: number;
};
