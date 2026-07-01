import type { NavigationItem } from '../types';

interface RoleNavigationProps {
  items: NavigationItem[];
  currentRole: string;
}

export const RoleNavigation = ({ items, currentRole }: RoleNavigationProps) => {
  const visibleItems = items.filter((item) => item.roles.includes(currentRole as NavigationItem['roles'][number]));

  return (
    <nav className="role-navigation" aria-label="Primary">
      {visibleItems.map((item) => (
        <a key={item.id} href={item.path} className="role-navigation__item">
          {item.label}
        </a>
      ))}
    </nav>
  );
};
