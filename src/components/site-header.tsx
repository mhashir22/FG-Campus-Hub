import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const navLink =
  "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
const navActive = "bg-secondary text-foreground";

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">Campus Hub</span>
            <span className="block text-[11px] text-muted-foreground">FG Degree College Wah Cantt</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link to="/" className={navLink} activeProps={{ className: navActive }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/events" className={navLink} activeProps={{ className: navActive }}>
            Events
          </Link>
          <Link to="/blog" className={navLink} activeProps={{ className: navActive }}>
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild size="sm">
              <Link to="/admin">
                <Shield /> Admin
              </Link>
            </Button>
          )}
          {user ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              aria-label="Sign out"
            >
              <LogOut />
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to="/auth">Admin sign in</Link>
            </Button>
          )}
        </div>
      </div>
      <nav className="flex items-center justify-center gap-1 border-t border-border/60 py-2 sm:hidden">
        <Link to="/" className={navLink} activeProps={{ className: navActive }} activeOptions={{ exact: true }}>
          Home
        </Link>
        <Link to="/events" className={navLink} activeProps={{ className: navActive }}>
          Events
        </Link>
        <Link to="/blog" className={navLink} activeProps={{ className: navActive }}>
          Blog
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-forest text-forest-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg">Campus Hub</p>
          <p className="text-sm opacity-75">FG Degree College, Wah Cantt</p>
        </div>
        <p className="text-sm opacity-60">Events, news and stories from our campus.</p>
      </div>
    </footer>
  );
}
