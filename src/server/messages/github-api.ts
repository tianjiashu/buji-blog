import { PublicApiError } from './errors.js';
import type { GitHubCommentsConfig } from './github-config.js';

const GITHUB_API_BASE_URL = 'https://api.github.com';
export const GITHUB_PAGE_SIZE = 100;

export interface GitHubIssue {
  number: number;
  title: string;
  pull_request?: unknown;
}

export interface GitHubIssueComment {
  id: number;
  body: string | null;
  created_at: string;
}

interface GitHubIssueSearchResult {
  items: GitHubIssue[];
}

export async function searchIssuesByTitle(config: GitHubCommentsConfig, title: string): Promise<GitHubIssue[]> {
  const query = new URLSearchParams({
    q: `repo:${config.owner}/${config.repo} type:issue in:title "${title}"`,
  });

  const result = await githubRequest<GitHubIssueSearchResult>(
    config,
    `/search/issues?${query.toString()}`,
  );
  return result.items;
}

export async function createIssue(config: GitHubCommentsConfig, title: string, body: string): Promise<GitHubIssue> {
  return githubRequest<GitHubIssue>(config, `/repos/${repoPath(config)}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body }),
  });
}

export async function listIssueComments(
  config: GitHubCommentsConfig,
  issueNumber: number,
  page: number,
): Promise<GitHubIssueComment[]> {
  return githubRequest<GitHubIssueComment[]>(
    config,
    `/repos/${repoPath(config)}/issues/${issueNumber}/comments?per_page=${GITHUB_PAGE_SIZE}&page=${page}`,
  );
}

export async function createIssueComment(
  config: GitHubCommentsConfig,
  issueNumber: number,
  body: string,
): Promise<GitHubIssueComment> {
  return githubRequest<GitHubIssueComment>(config, `/repos/${repoPath(config)}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function getIssueComment(config: GitHubCommentsConfig, commentId: string): Promise<GitHubIssueComment> {
  return githubRequest<GitHubIssueComment>(config, `/repos/${repoPath(config)}/issues/comments/${commentId}`);
}

export async function updateIssueComment(
  config: GitHubCommentsConfig,
  commentId: string,
  body: string,
): Promise<GitHubIssueComment> {
  return githubRequest<GitHubIssueComment>(config, `/repos/${repoPath(config)}/issues/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  });
}

async function githubRequest<T>(config: GitHubCommentsConfig, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'buji-main-comments',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new PublicApiError('留言不存在。', 404);
    }

    if (response.status === 401 || response.status === 403) {
      throw new PublicApiError('留言服务权限配置无效。', 502);
    }

    throw new PublicApiError('留言服务暂时无法访问。', response.status >= 500 ? 502 : 500);
  }

  return (await response.json()) as T;
}

function repoPath(config: GitHubCommentsConfig): string {
  return `${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;
}
