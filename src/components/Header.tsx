"use client";


import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import { apiClient } from "@/lib/api-client";
import SessionWrapper from "@/components/SessionWrapper";

// Import your resizable-navbar components
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

export default function HeaderWithResizableNav() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "How it works", link: "#how" },
    { name: "Features", link: "#features" },
    { name: "Reviews", link: "#reviews" },
    { name: "FAQ", link: "#faq" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Signed out successfully", "success");
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.deleteAcc();
      await signOut();
      showNotification("Account deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to delete account", "error");
    }
  };

  return (
    <SessionWrapper>
      <header className="bg-white border-b sticky top-0 z-40">
        <Navbar>
          {/* Desktop */}
          <NavBody>
    
              <NavbarLogo />
                
           
            

            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Hi, {session.user.username}
                  </span>
                  <NavbarButton variant="secondary" onClick={handleSignOut}>
                    Sign Out
                  </NavbarButton>
                  <NavbarButton variant="secondary" onClick={handleDeleteAccount}>
                    Delete Account
                  </NavbarButton>
                </>
              ) : (
                <div>
                   <NavItems items={navItems} />
                
                  <NavbarButton href="/login" variant="primary">Login</NavbarButton>
                </div>
                
              )}
            </div>
          </NavBody>

          {/* Mobile */}
          <MobileNav>
            <MobileNavHeader>
              
                <NavbarLogo />
                  
             
              <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            </MobileNavHeader>

            <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
              

              {session ? (
                <div className="flex flex-col gap-2 mt-2">
                  <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    Sign Out
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleDeleteAccount();
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    Delete Account
                  </NavbarButton>
                </div>
              ) : (
                <div>
                {navItems.map((item, idx) => (
                  <a
                    key={`mobile-link-${idx}`}
                    href={item.link}
                    className="relative text-neutral-600 dark:text-neutral-300 block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full mt-2"
                >
                  Login
                </NavbarButton>
                </div>
              )}
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </header>
    </SessionWrapper>
  );
}
