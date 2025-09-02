import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center text-sm text-muted-foreground ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          <Link
            to={item.path}
            className={
              index === items.length - 1
                ? "font-semibold text-foreground"
                : "hover:text-foreground"
            }
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
