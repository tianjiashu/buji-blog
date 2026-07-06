import { claimResonance, getClientFingerprint } from '../../src/server/messages/rate-limit.js';
import { getRedisClient, incrementResonance } from '../../src/server/messages/store.js';
import { PublicApiError } from '../../src/server/messages/errors.js';
import { errorResponse, jsonResponse, unknownErrorResponse } from '../../src/server/messages/http.js';
import { readJsonBody } from '../../src/server/messages/request.js';
import { validateResonanceInput } from '../../src/server/messages/validation.js';

export async function POST(request: Request): Promise<Response> {
  try {
    const { messageId } = validateResonanceInput(await readJsonBody<{ messageId?: unknown }>(request));
    const redis = getRedisClient();
    if (!redis) {
      return errorResponse('留言存储尚未配置。', 503);
    }

    const fingerprint = getClientFingerprint(request);
    const claimed = await claimResonance(redis, messageId, fingerprint);

    if (!claimed) {
      return errorResponse('你已经共鸣过这条留言了。', 409);
    }

    const resonanceCount = await incrementResonance(redis, messageId);
    return jsonResponse({ ok: true, resonanceCount });
  } catch (error) {
    if (error instanceof PublicApiError) {
      return errorResponse(error.message, error.status);
    }

    return unknownErrorResponse(error);
  }
}
