export enum AppointmentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface Appointment {
  id: string;
  clinicId: string;
  customerId: string;
  petId: string | null;
  doctorId: string | null;
  roomId: string | null;
  appointmentDate: string; // YYYY-MM-DD (alias for scheduleDate)
  scheduleDate?: string; // optional alias
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  status: AppointmentStatus;
  notes?: string;
  reason?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string | null;
  completedAt?: string | null;
}
