import { z } from 'zod';

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'checked-in',
  'examined',
  'completed',
]);

export type AppointmentStatusValue = z.infer<typeof appointmentStatusSchema>;

const statusOrder: AppointmentStatusValue[] = [
  'scheduled',
  'confirmed',
  'checked-in',
  'examined',
  'completed',
];

export const canTransitionAppointmentStatus = (
  current: AppointmentStatusValue,
  next: AppointmentStatusValue,
) => {
  const currentIndex = statusOrder.indexOf(current);
  const nextIndex = statusOrder.indexOf(next);

  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }

  return nextIndex === currentIndex + 1;
};
