export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return;
  }

  const Sentry = await import('@sentry/nextjs');

  const sentryOptions = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    spotlight: process.env.NODE_ENV === 'development',
    sendDefaultPii: true,
    tracesSampleRate: 1,
    debug: false
  };

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init(sentryOptions);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(sentryOptions);
  }
}

export const onRequestError = async (err: any, request: any, context: any) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true') {
    const Sentry = await import('@sentry/nextjs');
    return Sentry.captureRequestError(err, request, context);
  }
};
