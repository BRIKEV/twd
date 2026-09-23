<script setup>
import DeferredVideo from './DeferredVideo.vue'

// The comment mirrors the one the record job posts on a real pull request
// (linked from "Download the artifact"). Only the first clip is a real video,
// the paced recording from the Recording Runs docs; the other rows show the
// shape of the artifact: one file per test the branch added.
const prUrl = 'https://github.com/BRIKEV/twd-vue-example/pull/3#issuecomment-5598910647'

const clips = [
  { file: 'todos-creates-a-todo-with-every-field.mp4', open: true },
  { file: 'todos-marks-a-todo-done.mp4' },
  { file: 'todos-deletes-a-todo.mp4' },
  { file: 'todos-shows-validation-errors.mp4' },
]
</script>

<template>
  <div
    class="pr"
    role="figure"
    aria-label="A pull request timeline. The record label is added, and a minute later a bot comments with a link to four clips, one per test the branch added. The first clip plays a recorded test filling a todo form."
  >
    <div class="pr-event">
      <span class="pr-event-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2h5.5l6.5 6.5-5.5 5.5L2 7.5V2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="5.25" cy="5.25" r="1" fill="currentColor"/></svg>
      </span>
      <p class="pr-event-text">
        <strong>kevinccbsg</strong> added the
        <span class="pr-label"><span class="pr-label-dot" aria-hidden="true"></span>record</span>
        label
        <span class="pr-time">3 minutes ago</span>
      </p>
    </div>

    <article class="pr-comment">
      <span class="pr-avatar" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="11" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M12 4v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="3.5" r="1.2" fill="currentColor"/><circle cx="9" cy="13.5" r="1.4" fill="currentColor"/><circle cx="15" cy="13.5" r="1.4" fill="currentColor"/></svg>
      </span>
      <div class="pr-comment-box">
        <header class="pr-comment-head">
          <strong>github-actions</strong>
          <span class="pr-bot">bot</span>
          <span class="pr-time">commented 2 minutes ago</span>
        </header>
        <div class="pr-comment-body">
          <p class="pr-comment-text">
            Recording: 4 clips, one per test this branch added.
            <a :href="prUrl" target="_blank" rel="noopener">Download the artifact<span class="pr-sr"> (opens the real pull request on GitHub in a new tab)</span></a>
            and unzip.
          </p>

          <div class="pr-clips">
            <div class="pr-clips-dir">twd-artifacts/</div>
            <ul class="pr-clip-list">
              <li v-for="clip in clips" :key="clip.file" class="pr-clip-item" :class="{ 'is-open': clip.open }">
                <div class="pr-clip-row">
                  <svg class="pr-clip-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 6h13M1.5 10h13M4.5 3v10M11.5 3v10" stroke="currentColor" stroke-width="1"/></svg>
                  <span class="pr-clip-name">{{ clip.file }}</span>
                </div>
                <div v-if="clip.open" class="pr-clip-player">
                  <DeferredVideo
                    src="/videos/twd-record-paced.mp4"
                    poster="/images/twd-record-poster.jpg"
                    label="Recorded test run: a todo form is filled in field by field, typed character by character, then submitted, and the new todo appears in the list below."
                    name="recorded test clip"
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.pr {
  --pr-label-text: #cf222e;
  --pr-label-bg: #ffebe9;
  --pr-label-border: #ffcecb;
  position: relative;
  max-width: 880px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

:global(.dark) .pr {
  --pr-label-text: #ff7b72;
  --pr-label-bg: rgba(248, 81, 73, 0.14);
  --pr-label-border: rgba(248, 81, 73, 0.45);
}

/* The timeline rail. Icons and the avatar sit on top of it with an opaque
   background, the way a pull request timeline draws it. */
.pr::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 8px;
  bottom: 24px;
  width: 2px;
  background: var(--vp-c-border);
}

.pr-event {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0 24px;
}

.pr-event-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.pr-event-text {
  margin: 0;
  color: var(--vp-c-text-2);
}

.pr-event-text strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.pr-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 2px;
  padding: 1px 10px 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--pr-label-border);
  background: var(--pr-label-bg);
  color: var(--pr-label-text);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.5;
  vertical-align: middle;
}

.pr-label-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.pr-time {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.pr-comment {
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.pr-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
}

.pr-comment-box {
  position: relative;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

/* Speech caret pointing at the avatar */
.pr-comment-box::before,
.pr-comment-box::after {
  content: '';
  position: absolute;
  top: 12px;
  left: -8px;
  border: 8px solid transparent;
  border-left: 0;
  border-right-color: var(--vp-c-border);
}

.pr-comment-box::after {
  left: -7px;
  border-right-color: var(--vp-c-bg-soft);
}

.pr-comment-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--vp-c-border);
  border-radius: 10px 10px 0 0;
  background: var(--vp-c-bg-soft);
}

.pr-comment-head strong {
  font-weight: 600;
}

.pr-bot {
  padding: 0 7px;
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.pr-comment-body {
  padding: 16px;
}

.pr-comment-text {
  margin: 0;
}

.pr-comment-text a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.pr-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.pr-clips {
  margin-top: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
}

.pr-clips-dir {
  padding: 8px 14px;
  border-bottom: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
}

.pr-clip-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pr-clip-item + .pr-clip-item {
  border-top: 1px solid var(--vp-c-border);
}

.pr-clip-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  color: var(--vp-c-text-1);
}

.pr-clip-icon {
  flex-shrink: 0;
  color: var(--vp-c-text-2);
}

.pr-clip-name {
  min-width: 0;
  overflow-wrap: anywhere;
}

.pr-clip-player {
  padding: 0 14px 14px;
}

.pr-clip-player :deep(.dvideo-media) {
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

@media (max-width: 640px) {
  .pr {
    font-size: 0.875rem;
  }

  .pr::before {
    left: 15px;
  }

  .pr-event-icon,
  .pr-avatar {
    width: 32px;
    height: 32px;
  }

  .pr-comment {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 12px;
  }

  .pr-comment-body,
  .pr-comment-head {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
