import type { NavigationItem } from '../types';

export const createNavigationItems = (items: Omit<NavigationItem, 'id'>[]): NavigationItem[] =>
  items.map((item, index) => ({ ...item, id: `${item.path}-${index}` }));
