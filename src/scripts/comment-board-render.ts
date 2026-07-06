import type { CommentMessage } from './comment-board-api';

export function renderMessages(list: Element, messages: CommentMessage[]): void {
  if (!Array.isArray(messages) || messages.length === 0) {
    list.innerHTML = '<p class="comment-list__empty">还没有留言。第一笔墨迹，留给你。</p>';
    return;
  }

  list.innerHTML = '';
  messages.forEach((message) => {
    list.append(createMessageElement(message));
  });
}

function createMessageElement(message: CommentMessage): HTMLElement {
  const item = document.createElement('article');
  item.className = 'comment-item';

  const header = document.createElement('div');
  header.className = 'comment-item__header';

  const author = document.createElement('strong');
  author.textContent = message.authorName;

  const time = document.createElement('time');
  time.dateTime = message.createdAt;
  time.textContent = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(message.createdAt));

  const content = document.createElement('p');
  content.className = 'comment-item__content';
  content.textContent = message.content;

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'comment-item__resonance';
  action.dataset.messageId = message.id;
  action.textContent = `共鸣 ${message.resonanceCount}`;

  header.append(author, time);
  item.append(header, content, action);

  return item;
}
