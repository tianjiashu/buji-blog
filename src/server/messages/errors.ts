export class PublicApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'PublicApiError';
  }
}

export function getPublicErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof PublicApiError) {
    return {
      message: error.message,
      status: error.status,
    };
  }

  return {
    message: '服务暂时不可用，请稍后再试。',
    status: 500,
  };
}
