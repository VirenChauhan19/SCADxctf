// Serializers that turn Prisma rows into plain, client-safe objects (ISO date
// strings, parsed JSON) for passing from server components into client islands.
import { parsePersonalBests } from "./utils";

export type AthleteDTO = {
  id: string;
  name: string;
  email: string;
  gradYear: number | null;
  events: string | null;
  hometown: string | null;
  phone: string | null;
  bio: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  personalBests: { event: string; time: string }[];
  createdAtISO: string;
};

export type WorkoutDTO = {
  id: string;
  title: string;
  dateISO: string;
  type: string;
  scope: string;
  distance: string | null;
  pace: string | null;
  warmup: string | null;
  mainSet: string | null;
  cooldown: string | null;
  notes: string | null;
  location: string | null;
  link: string | null;
};

export type FeedbackDTO = {
  completed: boolean;
  effort: number | null;
  feeling: string | null;
  soreness: string | null;
  notes: string | null;
  updatedAtISO: string;
};

export type AssignmentDTO = {
  id: string;
  status: string;
  customNote: string | null;
  viewedAtISO: string | null;
  workout: WorkoutDTO;
  feedback: FeedbackDTO | null;
};

export type MessageDTO = {
  id: string;
  type: string;
  body: string;
  senderId: string;
  recipientId: string | null;
  createdISO: string;
  read: boolean;
};

type AnyUser = {
  id: string;
  name: string;
  email: string;
  gradYear?: number | null;
  events?: string | null;
  hometown?: string | null;
  phone?: string | null;
  bio?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  personalBests?: string | null;
  createdAt?: Date;
};

export function toAthleteDTO(u: AnyUser): AthleteDTO {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    gradYear: u.gradYear ?? null,
    events: u.events ?? null,
    hometown: u.hometown ?? null,
    phone: u.phone ?? null,
    bio: u.bio ?? null,
    emergencyName: u.emergencyName ?? null,
    emergencyPhone: u.emergencyPhone ?? null,
    personalBests: parsePersonalBests(u.personalBests),
    createdAtISO: (u.createdAt ?? new Date()).toISOString(),
  };
}

type AnyWorkout = {
  id: string;
  title: string;
  date: Date;
  type: string;
  scope: string;
  distance: string | null;
  pace: string | null;
  warmup: string | null;
  mainSet: string | null;
  cooldown: string | null;
  notes: string | null;
  location: string | null;
  link: string | null;
};

export function toWorkoutDTO(w: AnyWorkout): WorkoutDTO {
  return {
    id: w.id,
    title: w.title,
    dateISO: w.date.toISOString(),
    type: w.type,
    scope: w.scope,
    distance: w.distance,
    pace: w.pace,
    warmup: w.warmup,
    mainSet: w.mainSet,
    cooldown: w.cooldown,
    notes: w.notes,
    location: w.location,
    link: w.link,
  };
}

type AnyFeedback = {
  completed: boolean;
  effort: number | null;
  feeling: string | null;
  soreness: string | null;
  notes: string | null;
  updatedAt: Date;
} | null;

export function toFeedbackDTO(f: AnyFeedback): FeedbackDTO | null {
  if (!f) return null;
  return {
    completed: f.completed,
    effort: f.effort,
    feeling: f.feeling,
    soreness: f.soreness,
    notes: f.notes,
    updatedAtISO: f.updatedAt.toISOString(),
  };
}

type AnyAssignment = {
  id: string;
  status: string;
  customNote: string | null;
  viewedAt: Date | null;
  workout: AnyWorkout;
  feedback?: AnyFeedback;
};

export function toAssignmentDTO(a: AnyAssignment): AssignmentDTO {
  return {
    id: a.id,
    status: a.status,
    customNote: a.customNote,
    viewedAtISO: a.viewedAt ? a.viewedAt.toISOString() : null,
    workout: toWorkoutDTO(a.workout),
    feedback: toFeedbackDTO(a.feedback ?? null),
  };
}

type AnyMessage = {
  id: string;
  type: string;
  body: string;
  senderId: string;
  recipientId: string | null;
  createdAt: Date;
  readAt: Date | null;
};

export function toMessageDTO(m: AnyMessage): MessageDTO {
  return {
    id: m.id,
    type: m.type,
    body: m.body,
    senderId: m.senderId,
    recipientId: m.recipientId,
    createdISO: m.createdAt.toISOString(),
    read: m.readAt != null,
  };
}
