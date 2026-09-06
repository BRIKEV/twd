/**
 * matchLayout watches the GEOMETRY of the page, not its appearance.
 *
 * It sees a block that grows, shrinks or moves, a list that appears, a
 * container that wraps, a flex or grid that collapses. It does NOT see a
 * changed string, a subtly changed colour, or white text on white. That is
 * deliberate: content is already covered by twd.should. The command is called
 * matchLayout and not matchSnapshot for the same reason, because the name is
 * half the training.
 */
import { log } from '../utils/log';
import { captureNode } from './layout/capture';
import { renderFailureImage } from './layout/overlay';
import {
  layoutChangedMessage,
  missingReferenceMessage,
  savedMessage,
  skippedDisabledMessage,
  skippedViewportMessage,
  updatedMessage,
  viewportMismatchMessage,
} from './layout/message';
import { diffRows, renderRowDiff, rowDistance } from './layout/rowDiff';
import { parse, serialize, widthOf } from './layout/snapFile';
import { readSnapshot, writeSnapshot } from './layout/transport';

/** The name becomes a file path, so keep it to characters that survive one. */
const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '');

export async function matchLayout(el: HTMLElement, name: string): Promise<void> {
  // The sidebar resizes the page, so a snapshot taken there is not a verdict.
  // Layout snapshots are decided by twd-cli; debug mode is for inspecting them.
  if (window.__TWD_SNAPSHOTS__ !== true) {
    log(skippedDisabledMessage(name));
    return;
  }

  const safeName = sanitize(name);
  if (!safeName) {
    throw new Error(
      `Invalid layout snapshot name "${name}". Use letters, digits, dashes or underscores.`,
    );
  }

  const isCI = window.__TWD_SNAPSHOT_CI__ === true;
  const isUpdate = window.__TWD_UPDATE_SNAPSHOTS__ === true;

  const reference = await readSnapshot(safeName);
  const capture = await captureNode(el);
  const viewport = `${window.innerWidth}x${window.innerHeight}`;

  const write = () =>
    writeSnapshot(safeName, {
      snap: serialize({ hash: capture.hash, size: capture.size, viewport, grid: capture.grid }),
    });

  if (!reference.exists || !reference.snap) {
    // Never create a baseline in CI. Otherwise a new test writes its own
    // reference, passes forever, and nobody finds out for months.
    if (isCI) throw new Error(missingReferenceMessage(name, reference.dir));
    await write();
    log(savedMessage(name));
    return;
  }

  const previous = parse(reference.snap);

  // Zero flaky by construction: a different viewport never fails in dev, it
  // skips. Under CI it fails, because otherwise a wrong viewport would skip
  // every snapshot and stay green while testing nothing.
  if (previous.viewport && previous.viewport !== viewport) {
    if (isCI) throw new Error(viewportMismatchMessage(name, previous.viewport, viewport));
    log(skippedViewportMessage(name, previous.viewport, viewport));
    return;
  }

  const ops = diffRows(previous.grid, capture.grid);
  const rowsDiffering = rowDistance(ops);

  // A size change IS a layout change even when no bit moves: a 20px line of
  // text fits inside one cell and does not shift its average.
  if (rowsDiffering === 0 && previous.size === capture.size) return;

  if (isUpdate) {
    await write();
    log(updatedMessage(name));
    return;
  }

  // Leave the reference alone and save the current capture beside it.
  const sameWidth = widthOf(previous.size) === widthOf(capture.size);
  await writeSnapshot(safeName, {
    png: renderFailureImage({
      capture,
      ops,
      referenceSize: previous.size,
      hasNewArea: sameWidth && capture.grid.rows > previous.grid.rows,
    }),
    suffix: '.failed',
  });

  throw new Error(
    layoutChangedMessage({
      name,
      dir: reference.dir,
      referenceSize: previous.size,
      currentSize: capture.size,
      rowsDiffering,
      diff: renderRowDiff(ops, capture.grid),
    }),
  );
}
