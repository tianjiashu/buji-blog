import {
  createIssue,
  createIssueComment,
  GITHUB_PAGE_SIZE,
  getIssueComment,
  listIssueComments,
  searchIssuesByTitle,
  updateIssueComment,
} from './github-api.js';
import type { GitHubCommentsConfig } from './github-config.js';
import { formatCommentBody, parseCommentBody } from './github-comment-body.js';
import { PublicApiError } from './errors.js';
import type { PublicMessage, StoredMessage } from './types.js';
import type { ValidMessageInput } from './validation.js';

const ISSUE_TITLE_PREFIX = '[comments]';
const MAX_COMMENT_SCAN_PAGES = 20;

export async function listMessages(config: GitHubCommentsConfig, articleSlug: string): Promise<PublicMessage[]> {
  const issue = await findIssueByArticleSlug(config, articleSlug);
  if (!issue) {
    return [];
  }

  const comments = await listAllIssueComments(config, issue.number);
  return comments
    .map((comment) => parseCommentBody(comment.id, comment.body))
    .filter((message): message is StoredMessage => message?.articleSlug === articleSlug)
    .map(toPublicMessage)
    .reverse();
}

export async function createMessage(
  config: GitHubCommentsConfig,
  input: ValidMessageInput,
): Promise<PublicMessage> {
  const issue = await findOrCreateArticleIssue(config, input.articleSlug);
  const createdAt = new Date().toISOString();
  const draft: StoredMessage = {
    id: 'pending',
    articleSlug: input.articleSlug,
    authorName: input.authorName,
    content: input.content,
    createdAt,
    resonanceCount: 0,
  };

  const comment = await createIssueComment(config, issue.number, formatCommentBody(draft));
  return toPublicMessage({
    ...draft,
    id: String(comment.id),
    createdAt: comment.created_at || draft.createdAt,
  });
}

export async function incrementResonance(config: GitHubCommentsConfig, messageId: string): Promise<number> {
  const comment = await getIssueComment(config, messageId);
  const message = parseCommentBody(comment.id, comment.body);

  if (!message) {
    throw new PublicApiError('留言不存在。', 404);
  }

  const updated: StoredMessage = {
    ...message,
    resonanceCount: message.resonanceCount + 1,
  };
  // GitHub Issues comments do not support atomic custom counters; this is best-effort for low-volume blog interactions.
  const saved = await updateIssueComment(config, messageId, formatCommentBody(updated));
  const savedMessage = parseCommentBody(saved.id, saved.body);

  return savedMessage?.resonanceCount ?? updated.resonanceCount;
}

async function findOrCreateArticleIssue(config: GitHubCommentsConfig, articleSlug: string) {
  const issue = await findIssueByArticleSlug(config, articleSlug);
  if (issue) {
    return issue;
  }

  return createIssue(config, issueTitle(articleSlug), `Comments for \`${articleSlug}\`.`);
}

async function findIssueByArticleSlug(config: GitHubCommentsConfig, articleSlug: string) {
  const title = issueTitle(articleSlug);
  const issues = await searchIssuesByTitle(config, title);
  return issues.find((candidate) => candidate.title === title && !candidate.pull_request) ?? null;
}

async function listAllIssueComments(config: GitHubCommentsConfig, issueNumber: number) {
  const comments: Awaited<ReturnType<typeof listIssueComments>> = [];

  for (let page = 1; page <= MAX_COMMENT_SCAN_PAGES; page += 1) {
    const pageComments = await listIssueComments(config, issueNumber, page);
    comments.push(...pageComments);

    if (pageComments.length < GITHUB_PAGE_SIZE) {
      return comments;
    }
  }

  return comments;
}

function toPublicMessage(message: StoredMessage): PublicMessage {
  return {
    id: message.id,
    articleSlug: message.articleSlug,
    authorName: message.authorName,
    content: message.content,
    createdAt: message.createdAt,
    resonanceCount: message.resonanceCount,
  };
}

function issueTitle(articleSlug: string): string {
  return `${ISSUE_TITLE_PREFIX} ${articleSlug}`;
}
