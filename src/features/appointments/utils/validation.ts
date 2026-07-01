export class ValidationError extends Error {}

export function isTimeString(t?: string) {
  return typeof t === 'string' && /^\d{2}:\d{2}$/.test(t);
}

type AppointmentPayload = {
  customerId?: string;
  clinicId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
};

export function validateAppointmentPayload(payload: Partial<AppointmentPayload>, opts: { partial?: boolean } = {}) {
  if (!opts.partial) {
    if (!payload.customerId) throw new ValidationError('customerId is required');
    if (!payload.clinicId) throw new ValidationError('clinicId is required');
    if (!payload.appointmentDate) throw new ValidationError('appointmentDate is required');
    if (!payload.startTime || !isTimeString(payload.startTime)) throw new ValidationError('startTime is required and must be HH:MM');
    if (!payload.endTime || !isTimeString(payload.endTime)) throw new ValidationError('endTime is required and must be HH:MM');
  } else {
    if (payload.startTime && !isTimeString(payload.startTime)) throw new ValidationError('startTime must be HH:MM');
    if (payload.endTime && !isTimeString(payload.endTime)) throw new ValidationError('endTime must be HH:MM');
  }

  if (payload.startTime && payload.endTime) {
    const [sh, sm] = (payload.startTime as string).split(':').map(Number);
    const [eh, em] = (payload.endTime as string).split(':').map(Number);
    const s = sh * 60 + sm;
    const e = eh * 60 + em;
    if (e <= s) throw new ValidationError('endTime must be after startTime');
  }

  if (payload.appointmentDate) {
    const today = new Date();
    const apDate = new Date((payload.appointmentDate as string) + 'T00:00:00');
    if (apDate < new Date(today.toISOString().slice(0,10) + 'T00:00:00')) throw new ValidationError('appointmentDate cannot be in the past');
  }
}
