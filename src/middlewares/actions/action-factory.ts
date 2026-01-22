"use server";

import { revalidatePath } from "next/cache";

/**
 * Middleware type definition
 */
type ActionHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * Unified factory to create actions with middleware (logging, error handling, etc.)
 * This provides a consistent way to handle all server actions in the app.
 */
export async function createAction<TInput, TOutput>(
  name: string,
  handler: ActionHandler<TInput, TOutput>,
  input: TInput,
  options: {
    revalidate?: string;
    revalidateTags?: string[];
    isPublic?: boolean;
  } = {}
) {
  const startTime = Date.now();
  const prefix = options.isPublic ? "[PUBLIC ACTION]" : "[PRIVATE ACTION]";



  try {
    const result = await handler(input);

    if (options.revalidate) {
      revalidatePath(options.revalidate);
    }
    if (options.revalidateTags) {
      const { revalidateTag } = await import("next/cache");
      for (const tag of options.revalidateTags) {
        revalidateTag(tag);
      }
    }

    const duration = Date.now() - startTime;


    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;


    // We throw the error so Next.js can handle it or the caller can catch it.
    // In some cases, we might want to return a { success: false, error: ... } object,
    // but for consistency with existing public actions, we throw.
    throw error;
  }
}

/**
 * Public Action wrapper
 */
export async function createPublicAction<TInput, TOutput>(
  name: string,
  handler: ActionHandler<TInput, TOutput>,
  input: TInput,
) {
  return createAction(name, handler, input, { isPublic: true });
}

/**
 * Private Action wrapper (authenticated/admin actions)
 */
export async function createPrivateAction<TInput, TOutput>(
  name: string,
  handler: ActionHandler<TInput, TOutput>,
  input: TInput,
) {
  // Logic for authentication could be added here centralizing it for all private actions
  return createAction(name, handler, input, { isPublic: false });
}

/**
 * Helper for actions that follow the { success, data, error } pattern.
 * This can be used to bridge old code to the new unified factory.
 */
export async function actionMiddleware<TInput, TOutput>(
  name: string,
  handler: ActionHandler<TInput, TOutput>,
  input: TInput,
  options: { revalidate?: string; revalidateTags?: string[] } = {}
): Promise<{ success: boolean; data?: TOutput; error?: string }> {
  try {
    const data = await createAction(name, handler, input, { isPublic: false, ...options });
    return { success: true, data: data as TOutput };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Ocorreu um erro interno no servidor."
    };
  }
}
