import { PublicApiError } from './errors.js';

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new PublicApiError('请求体不是有效的 JSON。');
  }
}
