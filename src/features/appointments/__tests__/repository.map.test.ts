import { describe, it, expect } from 'vitest';
import { mapRowToAppointment } from '../repositories/supabaseAppointmentRepository';

describe('supabase appointment mapper', () => {
  it('maps row to appointment', () => {
    const row = {
      id: 'a1', customer_id: 'c1', pet_id: 'p1', doctor_id: 'd1', clinic_id: 'cl1', appointment_date: '2099-01-01', start_time: '09:00', end_time: '09:30', status: 'scheduled', notes: 'n', reason: 'r', created_by: 'u1', created_at: '2026-01-01T00:00:00Z', duration: 30, room_id: 'r1'
    } as Record<string, unknown>;
    const appt = mapRowToAppointment(row);
    expect(appt.id).toBe('a1');
    expect(appt.duration).toBe(30);
    expect(appt.roomId).toBe('r1');
  });
});
