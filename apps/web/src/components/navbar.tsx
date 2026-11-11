"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu";
import Link from "next/link";

import type { ColumnLink, NavColumn, NavigationData } from "@/types";
import { AccountLink } from "./account/account-link";
import { CartDrawer } from "./cart/cart-drawer";
import { CartToggle } from "./cart/cart-toggle";
import { MenuLink } from "./elements/menu-link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { CollectionGroupDropdown } from "./nav/collection-group-dropdown";
import { SavedItemsDrawer } from "./saved-items/saved-items-drawer";
import { SavedItemsToggle } from "./saved-items/saved-items-toggle";
import { SearchToggle } from "./search/search-toggle";

function DesktopColumnDropdown({
  column,
}: {
  column: Extract<NavColumn, { type: "column" }>;
}) {
  return (
    <NavigationMenuItem value={column._key}>
      <NavigationMenuTrigger className="h-auto rounded-none bg-transparent px-0 py-2 tracking-[0.02em] hover:bg-transparent hover:text-foreground focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-foreground data-[state=open]:focus:bg-transparent data-[state=open]:hover:bg-transparent">
        {column.title}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="z-50 min-w-70 p-2 group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:shadow-lg">
        <div className="grid gap-1">
          {column.links?.map((link: ColumnLink) => (
            <NavigationMenuLink asChild key={link._key}>
              <MenuLink
                description={link.description || ""}
                href={link.href || ""}
                icon={link.icon}
                name={link.name || ""}
              />
            </NavigationMenuLink>
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function DesktopColumnLink({
  column,
}: {
  column: Extract<NavColumn, { type: "link" }>;
}) {
  if (!column.href) return null;

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        className="rounded-none p-0 py-2 font-medium tracking-[0.02em] hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground"
      >
        <Link href={column.href} prefetch>
          {column.name}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export function Navbar({
  navbarData,
  settingsData,
  accountEnabled = false,
}: NavigationData & { accountEnabled?: boolean }) {
  const { columns } = navbarData || {};
  const { siteTitle, logo } = settingsData || {};

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-black">
      <div className="site-container">
        <div className="flex h-10 items-center justify-between">
          {/* Desktop Navigation */}
          <NavigationMenu
            className="hidden max-w-none justify-start lg:flex"
            delayDuration={0}
            viewport={false}
          >
            <NavigationMenuList className="justify-start gap-6">
              {columns?.map((column) => {
                if (column.type === "column") {
                  return (
                    <DesktopColumnDropdown column={column} key={column._key} />
                  );
                }
                if (column.type === "link") {
                  return (
                    <DesktopColumnLink column={column} key={column._key} />
                  );
                }
                if (column.type === "collectionGroup") {
                  const cg = column as Extract<
                    NavColumn,
                    { type: "collectionGroup" }
                  >;
                  return (
                    <CollectionGroupDropdown
                      _key={cg._key}
                      collectionLinks={cg.collectionLinks ?? null}
                      collectionProducts={cg.collectionProducts ?? null}
                      key={cg._key}
                      title={cg.title ?? null}
                    />
                  );
                }
                return null;
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Logo */}
          <div className="flex h-10 items-center">
            <Logo logo={logo} text={siteTitle} />
          </div>

          {/* Desktop Actions */}
          <div className="hidden flex-1 items-center justify-end gap-6 lg:flex">
            <SavedItemsToggle variant="text" />
            {accountEnabled && <AccountLink variant="text" />}
            <SearchToggle />
            <CartToggle />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-4 lg:hidden">
            <SearchToggle />
            <SavedItemsToggle />
            {accountEnabled && <AccountLink />}
            <CartToggle />
            <MobileMenu navbarData={navbarData} settingsData={settingsData} />
          </div>
        </div>
      </div>

      <CartDrawer />
      <SavedItemsDrawer />
    </header>
  );
}
