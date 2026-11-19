import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaceSelect } from '../../ui/PaceSelect';

describe('PaceSelect', () => {
  it('draws its own chevron, hidden from assistive tech, instead of the native arrow', () => {
    render(<PaceSelect value={0} onChange={vi.fn()} />);
    const select = screen.getByRole('combobox', { name: 'Speed' });
    const wrapper = select.closest('.twd-pace-select-wrapper')!;
    expect(wrapper).not.toBeNull();
    const chevron = wrapper.querySelector('.twd-pace-select-chevron')!;
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(chevron.querySelector('[data-testid="chevron-down-icon"]')).not.toBeNull();
  });
});
