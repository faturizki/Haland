import type { Appointment } from '../types';
import type { ExtendedAppointmentRepository as AppointmentRepository } from '../repositories/appointmentRepository';
import type { RepositoryContext } from '../../shared/utils/repositoryContract';
import type { CustomerRepository } from '../../customers/repositories/customerRepository';
import type { CustomerRecord, PetRecord } from '../../customers/types';
import type { EventDispatcher } from '../../shared/services/domainEvents';
import { createDomainEvent } from '../../shared/services/domainEvents';
import { validateAppointmentPayload, ValidationError } from '../utils/validation';

export class AppointmentUseCases {
  constructor(private readonly repo: AppointmentRepository, private readonly customerRepo?: CustomerRepository, private readonly events?: EventDispatcher) {}

  async createAppointment(payload: Partial<Appointment>, createdBy: string, context?: RepositoryContext): Promise<Appointment> {
    validateAppointmentPayload(payload);

    // clinic context required
    const clinicId = payload.clinicId ?? context?.clinicId;
    if (!clinicId) throw new ValidationError('clinic context is required');

    // customer existence
    if (this.customerRepo) {
      const customers = await this.customerRepo.listCustomers(false, context);
      const found = customers.find((c: CustomerRecord) => c.id === payload.customerId);
      if (!found) throw new ValidationError('customer does not exist');
    }

    // pet active check
    if (payload.petId && this.customerRepo) {
      const pets = await this.customerRepo.listPets(payload.customerId as string, false, context);
      const pet = pets.find((p: PetRecord) => p.id === payload.petId && !p.deletedAt);
      if (!pet) throw new ValidationError('pet not found or not active');
    }

    // compute duration if absent and basic overlap checks
    if (!payload.duration && payload.startTime && payload.endTime) {
      const [sh, sm] = (payload.startTime as string).split(':').map(Number);
      const [eh, em] = (payload.endTime as string).split(':').map(Number);
      payload.duration = eh * 60 + em - (sh * 60 + sm);
    }

    // double-booking: doctor
    if (payload.doctorId && payload.appointmentDate && payload.startTime && payload.endTime) {
      const doctorAppointments = await this.repo.findByDoctor(payload.doctorId as string, { clinicId } as RepositoryContext);
      const s = (payload.startTime as string);
      const e = (payload.endTime as string);
      const overlaps = doctorAppointments.some((a: Appointment) => a.appointmentDate === payload.appointmentDate && !(a.endTime <= s || a.startTime >= e));
      if (overlaps) throw new ValidationError('doctor not available at requested time');
    }

    // room availability
    if (payload.roomId && payload.appointmentDate && payload.startTime && payload.endTime) {
      const dayAppointments = await this.repo.findByDate(payload.appointmentDate as string, { clinicId } as RepositoryContext);
      const s = (payload.startTime as string);
      const e = (payload.endTime as string);
      const overlaps = dayAppointments.some((a: Appointment) => a.roomId === payload.roomId && !(a.endTime <= s || a.startTime >= e));
      if (overlaps) throw new ValidationError('room not available at requested time');
    }

    const created = await this.repo.create(payload, createdBy, { ...(context ?? {}), clinicId });
    if (this.events) {
      await this.events.dispatch(createDomainEvent({ type: 'AppointmentCreated', aggregateId: created.id, payload: { id: created.id, clinicId: created.clinicId, customerId: created.customerId } }));
    }
    return created;
  }

  async updateAppointment(id: string, payload: Partial<Appointment>, context?: RepositoryContext): Promise<Appointment> {
    validateAppointmentPayload(payload, { partial: true });
    // For updates that change schedule/doctor/room, basic overlap checks
    const clinicId = payload.clinicId ?? context?.clinicId;
    if (!clinicId) throw new ValidationError('clinic context is required');

    if (payload.doctorId && payload.appointmentDate && payload.startTime && payload.endTime) {
      const doctorAppointments = await this.repo.findByDoctor(payload.doctorId as string, { clinicId } as RepositoryContext);
      const s = (payload.startTime as string);
      const e = (payload.endTime as string);
      const overlaps = doctorAppointments.some((a: Appointment) => a.id !== id && a.appointmentDate === payload.appointmentDate && !(a.endTime <= s || a.startTime >= e));
      if (overlaps) throw new ValidationError('doctor not available at requested time');
    }

    const updated = await this.repo.update(id, payload, { ...(context ?? {}), clinicId });
    if (this.events) {
      await this.events.dispatch(createDomainEvent({ type: 'AppointmentUpdated', aggregateId: updated.id, payload: { id: updated.id } }));
    }
    return updated;
  }

  async cancelAppointment(id: string, context?: RepositoryContext): Promise<void> {
    await this.repo.cancel(id, context);
    if (this.events) {
      await this.events.dispatch(createDomainEvent({ type: 'AppointmentCancelled', aggregateId: id, payload: { id } }));
    }
  }

  async deleteAppointment(id: string, context?: RepositoryContext): Promise<void> {
    await this.repo.delete(id, context);
  }

  async getAppointment(id: string, context?: RepositoryContext): Promise<Appointment | null> {
    return this.repo.findById(id, context);
  }

  async checkIn(id: string, context?: RepositoryContext): Promise<Appointment> {
    const a = await this.repo.checkIn(id, context);
    if (this.events) await this.events.dispatch(createDomainEvent({ type: 'AppointmentCheckedIn', aggregateId: a.id, payload: { id: a.id } }));
    return a;
  }

  async startConsultation(id: string, context?: RepositoryContext): Promise<Appointment> {
    const a = await this.repo.startConsultation(id, context);
    if (this.events) await this.events.dispatch(createDomainEvent({ type: 'AppointmentStarted', aggregateId: a.id, payload: { id: a.id } }));
    return a;
  }

  async completeAppointment(id: string, context?: RepositoryContext): Promise<Appointment> {
    const a = await this.repo.complete(id, context);
    if (this.events) await this.events.dispatch(createDomainEvent({ type: 'AppointmentCompleted', aggregateId: a.id, payload: { id: a.id } }));
    return a;
  }

  async listAppointments(context?: RepositoryContext): Promise<Appointment[]> {
    return this.repo.findAll(context);
  }

  async searchAppointments(term: string, context?: RepositoryContext): Promise<Appointment[]> {
    return this.repo.search(term, context);
  }
}
