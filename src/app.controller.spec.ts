import { AppController } from './app.controller';

describe('AppController', () => {
  it('health returns an ok status', () => {
    const controller = new AppController();

    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
