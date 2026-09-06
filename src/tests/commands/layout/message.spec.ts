import { describe, expect, it } from 'vitest';
import {
  layoutChangedMessage,
  missingReferenceMessage,
  savedMessage,
  skippedDisabledMessage,
  skippedViewportMessage,
  updatedMessage,
} from '../../../commands/layout/message';

const base = { name: 'landing', dir: '__twd_snapshots__' };

describe('layoutChangedMessage', () => {
  it('names the height change and carries the size delta on the headline', () => {
    const message = layoutChangedMessage({
      ...base,
      referenceSize: '577x512',
      currentSize: '577x532',
      rowsDiffering: 2,
    });

    expect(message).toContain(
      'Layout snapshot "landing" changed - the block height changed, 577x512 -> 577x532',
    );
    expect(message).toContain('Reference:  __twd_snapshots__/landing.snap');
    expect(message).toContain('Capture:    __twd_snapshots__/landing.failed.png');
    expect(message).toContain('Accept:  npx twd-cli --update-snapshots');
  });

  it('names the width change and warns that the grid rescaled', () => {
    const message = layoutChangedMessage({
      ...base,
      referenceSize: '577x512',
      currentSize: '344x376',
      rowsDiffering: 12,
    });

    expect(message).toContain('the block width changed, 577x512 -> 344x376');
    expect(message).toContain('indicative, not one to one');
  });

  it('reports differing rows when the size did not move', () => {
    const message = layoutChangedMessage({
      ...base,
      referenceSize: '900x720',
      currentSize: '900x720',
      rowsDiffering: 3,
    });

    expect(message).toContain('Layout snapshot "landing" changed - 3 rows differ');
    expect(message).not.toContain('indicative, not one to one');
  });

  it('never leaks the hash or an ASCII grid into the message', () => {
    const message = layoutChangedMessage({
      ...base,
      referenceSize: '577x512',
      currentSize: '577x532',
      rowsDiffering: 2,
    });

    expect(message).not.toContain('expected  ');
    expect(message).not.toMatch(/X = changed/);
  });
});

describe('single line messages', () => {
  it('distinguishes a saved reference from an updated one', () => {
    // An update must never be silent: a flag left on by accident rewrites every
    // reference and no test fails again.
    expect(savedMessage('landing')).toContain('saved');
    expect(updatedMessage('landing')).toContain('updated');
    expect(savedMessage('landing')).not.toContain('updated');
  });

  it('explains that snapshots are decided by twd-cli when disabled', () => {
    expect(skippedDisabledMessage('landing')).toContain('twd-cli');
    expect(skippedDisabledMessage('landing')).toContain('skipped');
  });

  it('shows both viewports when they do not match', () => {
    const message = skippedViewportMessage('landing', '1280x800', '1512x945');
    expect(message).toContain('1280x800');
    expect(message).toContain('1512x945');
  });

  it('says CI never creates a reference', () => {
    expect(missingReferenceMessage('landing', '__twd_snapshots__')).toContain('never creates');
  });
});
