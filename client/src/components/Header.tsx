import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface HeaderProps {
  onClearChat: () => void;
}

export default function Header({ onClearChat }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Don't render theme specific content until mounted to avoid hydration issues
  if (!mounted) return null;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between fixed top-0 w-full z-10">
      <div className="flex items-center">
        <svg
          className="w-7 h-7 text-primary mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M17 2.43994V12.4199C17 14.3899 15.59 15.1599 13.86 14.1199L12.54 13.3299C12.24 13.1499 11.76 13.1499 11.46 13.3299L10.14 14.1199C8.41 15.1599 7 14.3899 7 12.4199V2.43994"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <h1 className="text-lg font-semibold">Homework Helper</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Clear chat"
        >
          <i className="ri-delete-bin-line text-lg"></i>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <i className="ri-sun-line text-lg"></i>
          ) : (
            <i className="ri-moon-line text-lg"></i>
          )}
        </Button>
      </div>
    </header>
  );
}
