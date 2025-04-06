
import { PriorityType } from "@/components/PriorityBadge";
import { StatusType } from "@/components/StatusBadge";

export interface Grievance {
  id: string;
  title: string;
  description: string;
  date: string;
  status: StatusType;
  priority: PriorityType;
  submittedBy: string;
  attachments?: string[];
  assignedTo?: string;
  comments?: Comment[];
  lastUpdated?: string;
}

export interface Comment {
  id: string;
  text: string;
  date: string;
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  grievanceCredits: number;
  isBlocked: boolean;
  warnings: number;
  role: "user" | "admin";
  lastCreditUpdate?: string;
}
