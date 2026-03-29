export interface Stat {
  label: string;
  value: string;
  change?: string;
  status?: string;
  icon: string;
  color: string;
}

export interface Guild {
  id: string;
  name: string;
  borrows: string;
  trend: "up" | "down" | "stable";
  initials: string;
  color: string;
}

export interface LogEntry {
  id: string;
  action: string;
  entity: string;
  registrar: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  status: "ARCHIVED" | "VERIFIED" | "SETTLED";
}

export interface Borrowing {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  progress: number;
  timeLeft: string;
  status?: "DUE TODAY" | "NORMAL";
}

export interface Recommendation {
  id: string;
  title: string;
  author: string;
  cover: string;
}
