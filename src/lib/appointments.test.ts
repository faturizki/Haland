import { describe, expect, it } from 'vitest';
import { canTransitionAppointmentStatus } from './appointments';

describe('appointment status transitions', () => {
  it('allows forward progress without skipping', () => {
    expect(canTransitionAppointmentStatus('scheduled', 'confirmed')).toBe(true);
    expect(canTransitionAppointmentStatus('confirmed', 'checked-in')).toBe(true);
    expect(canTransitionAppointmentStatus('checked-in', 'examined')).toBe(true);
    expect(canTransitionAppointmentStatus('examined', 'completed')).toBe(true);
  });

  it('rejects invalid or skipped transitions', () => {
    expect(canTransitionAppointmentStatus('scheduled', 'checked-in')).toBe(false);
    expect(canTransitionAppointmentStatus('scheduled', 'completed')).toBe(false);
    expect(canTransitionAppointmentStatus('completed', 'scheduled')).toBe(false);
  });
});
