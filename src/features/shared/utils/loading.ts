export const createLoadingState = <T>(value: T | null = null) => ({
  isLoading: false,
  error: null as string | null,
  value,
});

export const withLoadingState = async <T>(operation: () => Promise<T>) => {
  const result = await operation();
  return result;
};
