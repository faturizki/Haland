import { supabase } from '../../auth/lib/supabase';
import type { Appointment } from '../types';
import type { AppointmentRepository } from './appointmentRepository';
import { toRepositoryError } from '../../shared/utils/repositoryError';
import { createRepositoryContext, type RepositoryContext } from '../../shared/utils/repositoryContract';
import { BaseRepository } from '../../shared/services/baseRepository';
import { createQueryBuilder } from '../../shared/utils/queryBuilder';

export const mapRowToAppointment = (row: Record<string, unknown>): Appointment => ({
  id: String(row.id),
  customerId: String(row.customer_id),
  petId: row.pet_id ? String(row.pet_id) : null,
  doctorId: row.doctor_id ? String(row.doctor_id) : null,
  clinicId: String(row.clinic_id || 'default-clinic'),
  appointmentDate: String(row.appointment_date),
  startTime: String(row.start_time),
  endTime: String(row.end_time),
  status: ((row.status != null ? String(row.status) : 'scheduled') as Appointment['status']),
  reason: row.reason != null ? String(row.reason) : undefined,
  notes: row.notes != null ? String(row.notes) : undefined,
  createdBy: String(row.created_by),
  updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  createdAt: String(row.created_at),
  updatedAt: row.updated_at != null ? String(row.updated_at) : undefined,
  cancelledAt: row.cancelled_at != null ? String(row.cancelled_at) : null,
  completedAt: row.completed_at != null ? String(row.completed_at) : null,
  duration: typeof row.duration === 'number' ? row.duration : (row.duration != null ? Number(row.duration) : 0),
  roomId: row.room_id != null ? String(row.room_id) : null,
});

export const supabaseAppointmentRepository: AppointmentRepository = new (class extends BaseRepository implements AppointmentRepository {
  async findAll(context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('findAllAppointments', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select);
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);

    return result.data;
  }

  async findById(id: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment | null> {
    const result = await this.executeWithContext('findAppointmentById', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).eq('id', id).single();
      if (error) {
        if ((error as { code?: string }).code === 'PGRST116') return null; // supabase row not found indicator
        throw toRepositoryError(error);
      }
      return data ? mapRowToAppointment(data as unknown as Record<string, unknown>) : null;
    }, context);

    return result.data;
  }

  async create(payload: Partial<Appointment>, createdBy: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment> {
    const result = await this.executeWithContext('createAppointment', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const insert = {
        customer_id: payload.customerId,
        pet_id: payload.petId ?? null,
        doctor_id: payload.doctorId ?? null,
        clinic_id: payload.clinicId ?? context.clinicId ?? 'default-clinic',
        appointment_date: payload.appointmentDate,
        start_time: payload.startTime,
        end_time: payload.endTime,
        status: payload.status ?? 'scheduled',
        reason: payload.reason ?? null,
        notes: payload.notes ?? null,
        created_by: createdBy,
      };
      const { data, error } = await supabase.from(querySpec.table).insert(insert).select(querySpec.select).single();
      if (error) throw toRepositoryError(error);
      return mapRowToAppointment(data as unknown as Record<string, unknown>);
    }, context);

    return result.data;
  }

  async update(id: string, payload: Partial<Appointment>, context: RepositoryContext = createRepositoryContext()): Promise<Appointment> {
    const result = await this.executeWithContext('updateAppointment', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).update({
        pet_id: payload.petId ?? undefined,
        doctor_id: payload.doctorId ?? undefined,
        appointment_date: payload.appointmentDate ?? undefined,
        start_time: payload.startTime ?? undefined,
        end_time: payload.endTime ?? undefined,
        status: payload.status ?? undefined,
        reason: payload.reason ?? undefined,
        notes: payload.notes ?? undefined,
        updated_by: payload.updatedBy ?? undefined,
      }).eq('id', id).select(querySpec.select).single();

      if (error) throw toRepositoryError(error);
      return mapRowToAppointment(data as unknown as Record<string, unknown>);
    }, context);

    return result.data;
  }

  async cancel(id: string, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('cancelAppointment', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { error } = await supabase.from(querySpec.table).update({ status: 'cancelled' }).eq('id', id);
      if (error) throw toRepositoryError(error);
      return undefined;
    }, context);
  }

  async delete(id: string, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('deleteAppointment', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { error } = await supabase.from(querySpec.table).delete().eq('id', id);
      if (error) throw toRepositoryError(error);
      return undefined;
    }, context);
  }

  async search(term: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('searchAppointments', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      // naive search across reason/notes
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).ilike('reason', `%${term}%`);
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);

    return result.data;
  }

  async paginate(limit = 25, offset = 0, context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('paginateAppointments', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').page({ limit, offset }).orderBy('appointment_date', 'desc').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).range(offset, offset + limit - 1).order('appointment_date', { ascending: false });
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);

    return result.data;
  }

  async count(context: RepositoryContext = createRepositoryContext()): Promise<number> {
    const result = await this.executeWithContext('countAppointments', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error, count } = await supabase.from(querySpec.table).select('id', { count: 'exact', head: false });
      if (error) throw toRepositoryError(error);
      // supabase returns count separately in some modes; fallback to data length
      return typeof count === 'number' ? count : (data ?? []).length;
    }, context);

    return result.data as unknown as number;
  }

  // Extended methods (non-breaking additions)
  async checkIn(id: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment> {
    const result = await this.executeWithContext('checkInAppointment', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).update({ status: 'checked_in', updated_at: new Date().toISOString() }).eq('id', id).select(querySpec.select).single();
      if (error) throw toRepositoryError(error);
      return mapRowToAppointment(data as unknown as Record<string, unknown>);
    }, context);
    return result.data;
  }

  async startConsultation(id: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment> {
    const result = await this.executeWithContext('startConsultation', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', id).select(querySpec.select).single();
      if (error) throw toRepositoryError(error);
      return mapRowToAppointment(data as unknown as Record<string, unknown>);
    }, context);
    return result.data;
  }

  async complete(id: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment> {
    const result = await this.executeWithContext('completeAppointment', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id).select(querySpec.select).single();
      if (error) throw toRepositoryError(error);
      return mapRowToAppointment(data as unknown as Record<string, unknown>);
    }, context);
    return result.data;
  }

  async findByDate(date: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('findAppointmentsByDate', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).eq('appointment_date', date).order('start_time', { ascending: true });
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);
    return result.data;
  }

  async findByDoctor(doctorId: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('findAppointmentsByDoctor', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).eq('doctor_id', doctorId).order('appointment_date', { ascending: false });
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);
    return result.data;
  }

  async findByPet(petId: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('findAppointmentsByPet', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).eq('pet_id', petId).order('appointment_date', { ascending: false });
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);
    return result.data;
  }

  async findByCustomer(customerId: string, context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('findAppointmentsByCustomer', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).eq('customer_id', customerId).order('appointment_date', { ascending: false });
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);
    return result.data;
  }

  async findToday(context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const today = new Date().toISOString().slice(0, 10);
    return this.findByDate(today, context);
  }

  async findUpcoming(context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('findUpcomingAppointments', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).gt('appointment_date', new Date().toISOString().slice(0,10)).order('appointment_date', { ascending: true });
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);
    return result.data;
  }

  async findCancelled(context: RepositoryContext = createRepositoryContext()): Promise<Appointment[]> {
    const result = await this.executeWithContext('findCancelledAppointments', 'appointments', async () => {
      const querySpec = createQueryBuilder('appointments', '*').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).eq('status', 'cancelled').order('appointment_date', { ascending: false });
      if (error) throw toRepositoryError(error);
      return (data ?? []).map((r) => mapRowToAppointment(r as unknown as Record<string, unknown>));
    }, context);
    return result.data;
  }
})();
