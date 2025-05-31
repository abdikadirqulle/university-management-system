import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { School, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { name: "Features", href: "#features" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

export function LandingNav() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-5 px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white">
          <School className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">
            <span className="text-primary">Scholar</span> Nexus
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white/90 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-white border-white/20 bg-white/5 hover:bg-white/10"
            >
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">Get Started</Link>
            </Button>
          </nav>
        )}

        {/* Mobile Menu Trigger */}
        {isMobile && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-black/90 border-white/10 text-white">
              <div className="flex flex-col gap-6 mt-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className="text-lg font-medium text-white/90 hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/20 bg-white/5 hover:bg-white/10"
                  >
                    <Link to="/login" onClick={closeMenu}>
                      Log In
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/login" onClick={closeMenu}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
