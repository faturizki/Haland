import { describe, it, expect, vi } from 'vitest';
import { AppointmentUseCases } from '../application/appointmentUseCases';
import { createInMemoryEventDispatcher } from '../../shared/services/domainEvents';
import type { Appointment } from '../types';
import type { CustomerRepository } from '../../customers/repositories/customerRepository';

const makeRepo = () => ({
  create: vi.fn(),
  findByDoctor: vi.fn(),
  findByDate: vi.fn(),
  update: vi.fn(),
  cancel: vi.fn(),
  checkIn: vi.fn(),
  startConsultation: vi.fn(),
  complete: vi.fn(),
} as any);

const makeCustomerRepo = () => ({
  listCustomers: vi.fn(),
  listPets: vi.fn(),
} as unknown as CustomerRepository);

describe('AppointmentUseCases', () => {
  it('creates appointment successfully and emits event', async () => {
    const repo = makeRepo();
    const customerRepo = makeCustomerRepo();
    const dispatcher = createInMemoryEventDispatcher();
    const eventsSeen: string[] = [];
    dispatcher.subscribe('AppointmentCreated', (e) => eventsSeen.push(String(e.aggregateId)));

    customerRepo.listCustomers.mockResolvedValue([{ id: 'c1' }]);
    customerRepo.listPets.mockResolvedValue([{ id: 'p1', customerId: 'c1', deletedAt: null }]);
    repo.findByDoctor.mockResolvedValue([]);
    repo.findByDate.mockResolvedValue([]);

    const created: Appointment = {
      id: 'a1', clinicId: 'cl1', customerId: 'c1', petId: 'p1', doctorId: 'd1', roomId: null,
      appointmentDate: '2099-01-01', startTime: '09:00', endTime: '09:30', duration: 30,
      status: 'scheduled' as any, notes: undefined, reason: undefined, createdBy: 'u1', createdAt: new Date().toISOString(),
    };
    repo.create.mockResolvedValue(created);

    const uc = new AppointmentUseCases(repo, customerRepo, dispatcher);
    const res = await uc.createAppointment({ customerId: 'c1', clinicId: 'cl1', appointmentDate: '2099-01-01', startTime: '09:00', endTime: '09:30', petId: 'p1', doctorId: 'd1' }, 'u1', { clinicId: 'cl1' } as any);
    expect(res).toEqual(created);
    expect(eventsSeen).toEqual(['a1']);
  });

  it('rejects when doctor double-booked', async () => {
    const repo = makeRepo();
    const customerRepo = makeCustomerRepo();
    customerRepo.listCustomers.mockResolvedValue([{ id: 'c1' }]);
    customerRepo.listPets.mockResolvedValue([{ id: 'p1', customerId: 'c1', deletedAt: null }]);
    repo.findByDoctor.mockResolvedValue([{ id: 'a2', appointmentDate: '2099-01-01', startTime: '09:15', endTime: '09:45', roomId: null, doctorId: 'd1', customerId: 'c2', clinicId: 'cl1', duration:30, status: 'scheduled' as any, createdBy:'u', createdAt: new Date().toISOString() }]);

    const uc = new AppointmentUseCases(repo, customerRepo);
    await expect(uc.createAppointment({ customerId: 'c1', clinicId: 'cl1', appointmentDate: '2099-01-01', startTime: '09:00', endTime: '09:30', petId: 'p1', doctorId: 'd1' }, 'u1', { clinicId: 'cl1' } as any)).rejects.toThrow();
  });

  it('update detects overlap', async () => {
    const repo = makeRepo();
    repo.findByDoctor.mockResolvedValue([{ id: 'a2', appointmentDate: '2099-01-01', startTime: '09:00', endTime: '10:00', roomId: null, doctorId: 'd1', customerId: 'c2', clinicId: 'cl1', duration:60, status: 'scheduled' as any, createdBy:'u', createdAt: new Date().toISOString() }]);
    const uc = new AppointmentUseCases(repo as any);
    await expect(uc.updateAppointment('a1', { doctorId: 'd1', appointmentDate: '2099-01-01', startTime: '09:30', endTime: '10:30' }, { clinicId: 'cl1' } as any)).rejects.toThrow();
  });

  it('checkin/start/complete flow dispatches events', async () => {
    const repo = makeRepo();
    const dispatcher = createInMemoryEventDispatcher();
    const events: string[] = [];
    dispatcher.subscribe('AppointmentCheckedIn', (e) => events.push(e.type));
    dispatcher.subscribe('AppointmentStarted', (e) => events.push(e.type));
    dispatcher.subscribe('AppointmentCompleted', (e) => events.push(e.type));

    const appt = { id: 'a1', clinicId:'cl1', customerId:'c1', petId:null, doctorId:'d1', roomId:null, appointmentDate:'2099-01-01', startTime:'09:00', endTime:'09:30', duration:30, status:'scheduled' as any, createdBy:'u', createdAt:new Date().toISOString() };
    repo.checkIn.mockResolvedValue({ ...appt, status: 'checked_in' });
    repo.startConsultation.mockResolvedValue({ ...appt, status: 'in_progress' });
    repo.complete.mockResolvedValue({ ...appt, status: 'completed' });

    const uc = new AppointmentUseCases(repo as any, undefined, dispatcher);
    await uc.checkIn('a1' , { clinicId: 'cl1' } as any);
    await uc.startConsultation('a1', { clinicId: 'cl1' } as any);
    await uc.completeAppointment('a1', { clinicId: 'cl1' } as any);

    expect(events).toEqual(['AppointmentCheckedIn','AppointmentStarted','AppointmentCompleted']);
  });
});
