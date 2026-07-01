import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../auth/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../auth/lib/supabase';
import { supabaseAppointmentRepository } from '../repositories/supabaseAppointmentRepository';

const makeChain = (result: any) => {
  // thenable chain object that supports both awaiting and chained calls like .select(...).eq(...).single()
  const makeThenable = () => {
    const obj: any = {};
    const inner = { data: result, error: null };
    obj.eq = (_col: string, _val: any) => obj;
    obj.single = async () => inner;
    obj.insert = (_payload: any) => ({ select: () => obj });
    obj.update = (_payload: any) => ({ eq: (_c: string, _v: any) => ({ select: () => obj }) });
    obj.delete = () => ({ eq: (_c: string, _v: any) => inner });
    obj.ilike = (_c: string, _pattern: string) => obj;
    obj.range = (_from: number, _to: number) => ({ order: () => inner });
    obj.order = (_col: string, _opts: any) => inner;
    obj.select = (..._args: any[]) => obj;
    // make thenable
    obj.then = (resolve: any) => Promise.resolve(resolve(inner));
    return obj;
  };
  const chain = makeThenable();
  return chain;
};

describe('supabaseAppointmentRepository methods', () => {
  beforeEach(() => {
    (supabase.from as any).mockReset();
  });

  it('findById returns mapped appointment', async () => {
    const row = { id: 'a1', customer_id: 'c1', clinic_id: 'cl1', appointment_date: '2099-01-01', start_time: '09:00', end_time: '09:30', created_by: 'u1', created_at: '2026-01-01T00:00:00Z' };
    (supabase.from as any).mockReturnValue(makeChain(row));
    const res = await supabaseAppointmentRepository.findById('a1', { clinicId: 'cl1' } as any);
    expect(res).toBeDefined();
    expect(res?.id).toBe('a1');
  });

  it('create inserts and returns appointment', async () => {
    const created = { id: 'a2', customer_id: 'c1', clinic_id: 'cl1', appointment_date: '2099-01-02', start_time: '10:00', end_time: '10:30', created_by: 'u1', created_at: '2026-01-02T00:00:00Z' };
    (supabase.from as any).mockReturnValue(makeChain(created));
    const res = await supabaseAppointmentRepository.create({ customerId: 'c1' } as any, 'u1', { clinicId: 'cl1' } as any);
    expect(res.id).toBe('a2');
  });

  it('cancel performs update without throwing', async () => {
    (supabase.from as any).mockReturnValue(makeChain({}));
    await expect(supabaseAppointmentRepository.cancel('a1', { clinicId: 'cl1' } as any)).resolves.toBeUndefined();
  });

  it('search returns array', async () => {
    const rows = [ { id: 'a3', customer_id: 'c1', clinic_id: 'cl1', appointment_date: '2099-01-03', start_time: '11:00', end_time: '11:30', created_by: 'u1', created_at: '2026-01-03T00:00:00Z' } ];
    (supabase.from as any).mockReturnValue(makeChain(rows));
    const res = await supabaseAppointmentRepository.search('term', { clinicId: 'cl1' } as any);
    expect(Array.isArray(res)).toBe(true);
  });

  it('count returns number', async () => {
    // special-case select with count options
    (supabase.from as any).mockReturnValue({
      select: async (_cols: string, opts: any) => ({ data: [{ id: 'a' }], count: 7, error: null }),
    });
    const res = await supabaseAppointmentRepository.count({ clinicId: 'cl1' } as any);
    expect(typeof res).toBe('number');
  });
});
