import { FALLBACK_STATUS_COPY, STATUS_COPY } from '../../src/utils/transactionStatusCopy';

describe('transactionStatusCopy', () => {
  it('maps every transaction status to a title and tone', () => {
    expect(STATUS_COPY.APPROVED).toEqual({ title: 'Aprobado', tone: 'success' });
    expect(STATUS_COPY.PENDING).toEqual({ title: 'Pendiente', tone: 'warning' });
    expect(STATUS_COPY.DECLINED).toEqual({ title: 'Rechazado', tone: 'danger' });
    expect(STATUS_COPY.ERROR).toEqual({ title: 'Algo salió mal', tone: 'danger' });
  });

  it('exposes a fallback for when there is no transaction', () => {
    expect(FALLBACK_STATUS_COPY).toEqual({ title: 'Algo salió mal', tone: 'danger' });
  });
});
