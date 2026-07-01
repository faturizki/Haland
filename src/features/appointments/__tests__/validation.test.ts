import { describe, it, expect } from 'vitest';
import { validateAppointmentPayload, ValidationError, isTimeString } from '../utils/validation';

describe('Appointment validation', () => {
  it('validates time string', () => {
    expect(isTimeString('08:30')).toBe(true);
    expect(isTimeString('8:30')).toBe(false);
    expect(isTimeString('0830')).toBe(false);
  });

  it('accepts valid payload', () => {
    const payload = { customerId: 'c1', clinicId: 'cl1', appointmentDate: '2099-01-01', startTime: '09:00', endTime: '10:00' };
    expect(() => validateAppointmentPayload(payload)).not.toThrow();
  });

  it('rejects endTime <= startTime', () => {
    const payload = { customerId: 'c1', clinicId: 'cl1', appointmentDate: '2099-01-01', startTime: '10:00', endTime: '10:00' };
    expect(() => validateAppointmentPayload(payload)).toThrowError(ValidationError);
  });

  it('rejects past appointmentDate', () => {
    const past = '2000-01-01';
    const payload = { customerId: 'c1', clinicId: 'cl1', appointmentDate: past, startTime: '09:00', endTime: '10:00' };
    expect(() => validateAppointmentPayload(payload)).toThrowError(ValidationError);
  });
});
