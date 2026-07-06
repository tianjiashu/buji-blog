export interface GitHubCommentsConfig {
  owner: string;
  repo: string;
  token: string;
}

let cachedConfig: GitHubCommentsConfig | null | undefined;

export function getGitHubCommentsConfig(): GitHubCommentsConfig | null {
  if (cachedConfig !== undefined) {
    return cachedConfig;
  }

  const owner = process.env.GITHUB_COMMENTS_OWNER?.trim();
  const repo = process.env.GITHUB_COMMENTS_REPO?.trim();
  const token = process.env.GITHUB_COMMENTS_TOKEN?.trim();

  if (!owner || !repo || !token) {
    cachedConfig = null;
    return cachedConfig;
  }

  cachedConfig = { owner, repo, token };
  return cachedConfig;
}
