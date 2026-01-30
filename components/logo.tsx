"use client";

import { appConfig } from "@/lib/config";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
}

export function Logo({ className = "", showText = true, href = "/" }: LogoProps) {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[appConfig.logo.icon] || LucideIcons.GalleryVerticalEnd;

  const logoContent = (
    <>
      <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
        <IconComponent className="size-4" />
      </div>
      {showText && <span>{appConfig.company.name}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`flex items-center gap-2 font-medium ${className}`}>
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2 font-medium ${className}`}>
      {logoContent}
    </div>
  );
}
