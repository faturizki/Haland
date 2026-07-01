export const isEmptyCollection = <T>(value: T[] | null | undefined) => !value || value.length === 0;
export const emptyStateMessage = (resource: string) => `No ${resource} found.`;
