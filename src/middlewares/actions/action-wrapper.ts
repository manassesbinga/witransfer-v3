"use server";

/**
 * Basic action middleware to wrap server actions with error handling and logging.
 */
export async function actionMiddleware<T>(
  name: string,
  action: () => Promise<T>,
): Promise<{ success: boolean; data?: T; error?: string }> {
  console.log(`[ACTION] Executing: ${name}`);
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: any) {
    console.error(`[ACTION ERROR] ${name}:`, error);
    return {
      success: false,
      error: error.message || "Ocorreu um erro interno no servidor.",
    };
  }
}
