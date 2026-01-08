"use server";

/**
 * Middleware type definition
 */
type ActionHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * Factory to create actions with middleware (logging, error handling, etc.)
 */
export async function createAction<TInput, TOutput>(
  name: string,
  handler: ActionHandler<TInput, TOutput>,
  input: TInput,
) {
  const startTime = Date.now();
  console.log(`[ACTION START] ${name} - Input:`, JSON.stringify(input));

  try {
    const result = await handler(input);
    const duration = Date.now() - startTime;
    console.log(`[ACTION SUCCESS] ${name} (${duration}ms)`);
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[ACTION ERROR] ${name} (${duration}ms):`, error.message);

    // You could decide to wrap error here or re-throw
    // Re-throwing allows standard Next.js error boundaries to catch it
    throw error;
  }
}

/**
 * Public Action wrapper (could add public-specific logic like analytics tags)
 */
export async function createPublicAction<TInput, TOutput>(
  name: string,
  handler: ActionHandler<TInput, TOutput>,
  input: TInput,
) {
  // Add specific headers or logic for public actions if needed
  return createAction(`Public:${name}`, handler, input);
}
