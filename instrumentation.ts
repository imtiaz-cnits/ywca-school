export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initSchedulerDaemon } = await import('@/lib/schedules');
      initSchedulerDaemon();
    } catch (err) {
      console.error('[Instrumentation] Error starting SMS schedule daemon:', err);
    }
  }
}
