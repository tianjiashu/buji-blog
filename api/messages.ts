import { assertMessageRateLimit, getClientFingerprint } from '../src/server/messages/rate-limit.js';
import { readJsonBody } from '../src/server/messages/request.js';
import { createMessage, getRedisClient, listMessages } from '../src/server/messages/store.js';
import type { CreateMessageInput } from '../src/server/messages/types.js';
import { validateArticleSlug, validateCreateMessage } from '../src/server/messages/validation.js';
import { errorResponse, jsonResponse, unknownErrorResponse } from '../src/server/messages/http.js';

export async function GET(request: Request): Promise<Response> {
  const redis = getRedisClient();
  if (!redis) {
    return jsonResponse({ ok: true, configured: false, messages: [] });
  }

  try {
    const articleSlug = validateArticleSlug(new URL(request.url).searchParams.get('articleSlug'));
    const messages = await listMessages(redis, articleSlug);

    return jsonResponse({ ok: true, configured: true, messages });
  } catch (error) {
    return unknownErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const input = validateCreateMessage(await readJsonBody<CreateMessageInput>(request));
    const redis = getRedisClient();
    if (!redis) {
      return errorResponse('留言存储尚未配置。', 503);
    }

    const fingerprint = getClientFingerprint(request);

    await assertMessageRateLimit(redis, fingerprint);

    const message = await createMessage(redis, input);
    return jsonResponse({ ok: true, message }, { status: 201 });
  } catch (error) {
    return unknownErrorResponse(error);
  }
}
