import { fetchMessages, submitMessage, submitResonance } from './comment-board-api';
import { renderMessages } from './comment-board-render';

const boards = document.querySelectorAll('[data-article-slug]');

boards.forEach((board) => {
  const articleSlug = board.getAttribute('data-article-slug') ?? '';
  const form = board.querySelector('[data-comment-form]');
  const textarea = form?.querySelector('textarea[name="content"]');
  const count = board.querySelector('[data-comment-count]');
  const list = board.querySelector('[data-comment-list]');
  const status = board.querySelector('[data-comment-status]');

  if (!(form instanceof HTMLFormElement) || !(textarea instanceof HTMLTextAreaElement) || !count || !list || !status) {
    return;
  }

  const setStatus = (message: string, tone = 'muted') => {
    status.textContent = message;
    status.setAttribute('data-tone', tone);
  };

    const loadMessages = async () => {
      const result = await fetchMessages(articleSlug);

      if (!result.configured) {
        setStatus('留言存储尚未配置，当前只展示页面入口。', 'muted');
      }

      renderMessages(list, result.messages);
  };

  textarea.addEventListener('input', () => {
    count.textContent = `${textarea.value.length} / 600`;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitter = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    if (submitter instanceof HTMLButtonElement) {
      submitter.disabled = true;
    }
      setStatus('正在寄出...', 'muted');

      try {
        await submitMessage(articleSlug, formData);
        form.reset();
        count.textContent = '0 / 600';
        setStatus('留言已留下。', 'success');
      await loadMessages();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '留言失败。', 'error');
    } finally {
      if (submitter instanceof HTMLButtonElement) {
        submitter.disabled = false;
      }
    }
  });

  list.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || !target.dataset.messageId) {
      return;
    }

    target.disabled = true;

      try {
        const resonanceCount = await submitResonance(target.dataset.messageId);
        target.textContent = `共鸣 ${resonanceCount}`;
        setStatus('已记下一次共鸣。', 'success');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '共鸣失败。', 'error');
    } finally {
      target.disabled = false;
    }
  });

    loadMessages().catch(() => {
      setStatus('留言暂时无法载入。', 'error');
      renderMessages(list, []);
    });
  });
