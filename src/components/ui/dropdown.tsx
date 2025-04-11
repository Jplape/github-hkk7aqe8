import { Menu } from '@headlessui/react';
import { ReactNode } from 'react';

export function Dropdown({ children }: { children: ReactNode }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {children}
    </Menu>
  );
}

Dropdown.Button = Menu.Button;
Dropdown.Items = Menu.Items;
Dropdown.Item = Menu.Item;