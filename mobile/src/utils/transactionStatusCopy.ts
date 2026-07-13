import { TransactionStatus } from '../features/transaction/transactionSlice';
import { StatusAnimationTone } from '../components/StatusAnimation';

export interface TransactionStatusCopy {
  title: string;
  tone: StatusAnimationTone;
}

/** Single source of truth for per-status copy, shared by SuccessScreen and FailureScreen. */
export const STATUS_COPY: Record<TransactionStatus, TransactionStatusCopy> = {
  APPROVED: { title: 'Aprobado', tone: 'success' },
  PENDING: { title: 'Pendiente', tone: 'warning' },
  DECLINED: { title: 'Rechazado', tone: 'danger' },
  ERROR: { title: 'Algo salió mal', tone: 'danger' },
};

export const FALLBACK_STATUS_COPY: TransactionStatusCopy = { title: 'Algo salió mal', tone: 'danger' };
