import { twd, userEvent } from '../../../../src/index';
import { describe, it } from '../../../../src/runner';

describe('Hello World', () => {
  it('should display the welcome title and counter button', async () => {
    await twd.visit('/');
    const button = await twd.get('[data-testid="counter-button"]');
    button.should('be.visible').should('have.text', 'count is 0');
    await userEvent.click(button.el);
    button.should('have.text', 'count is 1');
  });
});