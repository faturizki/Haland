import type { Appointment } from '../types';
import type { RepositoryContext } from '../../shared/utils/repositoryContract';

export interface AppointmentRepository {
  findAll(context?: RepositoryContext): Promise<Appointment[]>;
  findById(id: string, context?: RepositoryContext): Promise<Appointment | null>;
  create(payload: Partial<Appointment>, createdBy: string, context?: RepositoryContext): Promise<Appointment>;
  update(id: string, payload: Partial<Appointment>, context?: RepositoryContext): Promise<Appointment>;
  cancel(id: string, context?: RepositoryContext): Promise<void>;
  delete(id: string, context?: RepositoryContext): Promise<void>;
  search(term: string, context?: RepositoryContext): Promise<Appointment[]>;
  paginate(limit: number, offset: number, context?: RepositoryContext): Promise<Appointment[]>;
  count(context?: RepositoryContext): Promise<number>;
}

export interface ExtendedAppointmentRepository extends AppointmentRepository {
  checkIn(id: string, context?: RepositoryContext): Promise<Appointment>;
  complete(id: string, context?: RepositoryContext): Promise<Appointment>;
  startConsultation(id: string, context?: RepositoryContext): Promise<Appointment>;
  findByDate(date: string, context?: RepositoryContext): Promise<Appointment[]>;
  findByDoctor(doctorId: string, context?: RepositoryContext): Promise<Appointment[]>;
  findByPet(petId: string, context?: RepositoryContext): Promise<Appointment[]>;
  findByCustomer(customerId: string, context?: RepositoryContext): Promise<Appointment[]>;
  findToday(context?: RepositoryContext): Promise<Appointment[]>;
  findUpcoming(context?: RepositoryContext): Promise<Appointment[]>;
  findCancelled(context?: RepositoryContext): Promise<Appointment[]>;
}
