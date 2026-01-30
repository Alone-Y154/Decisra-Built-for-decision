"use client";

import Link from "next/link";
import { Scale } from "lucide-react";

const footerLinks = {
  product: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ],
  company: [
    { label: "Why Decisra", href: "/#why-decisra" },
    { label: "Contact", href: "/#contact" },
  ],
  legal: [
    { label: "Privacy", href: "/legal#privacy" },
    { label: "Terms", href: "/legal#terms" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Scale className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-semibold">Decisra</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Decisions deserve more than meetings.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Product
            </p>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Company
            </p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Legal
            </p>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Decisra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
