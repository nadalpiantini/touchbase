'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import OrgDropdown from '@/components/org/OrgDropdown';

interface NavItem {
  href: string;
  label: string;
  roles?: string[];
}

interface ResponsiveNavProps {
  locale: string;
  userRole?: string;
  userEmail: string;
  navItems: NavItem[];
  logoHref: string;
}

export function ResponsiveNav({ locale, userRole, userEmail, navItems, logoHref }: ResponsiveNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Filter nav items by role
  const visibleItems = navItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <header className="bg-tb-navy text-white border-b border-tb-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-2">
            <Image
              src="/touchbase-logo.png"
              alt="TouchBase"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-display font-bold tracking-wide">TOUCHBASE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-sans hover:text-tb-beige transition ${
                  pathname === item.href ? 'text-tb-beige font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <OrgDropdown />
              <span className="text-sm font-sans text-tb-bone">
                {userEmail}
              </span>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden pb-4 border-t border-white/10 mt-2 pt-4">
            <div className="flex flex-col gap-2">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-sans hover:bg-white/10 transition ${
                    pathname === item.href ? 'bg-white/10 font-semibold' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 py-2 border-t border-white/10 mt-2 pt-2">
                <div className="mb-2">
                  <OrgDropdown />
                </div>
                <div className="px-4 py-2 text-sm font-sans text-tb-bone/80">
                  {userEmail}
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

