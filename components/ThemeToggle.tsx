import { useCallback, useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

const STORAGE_KEY = "zwit-theme";
type Theme = "light" | "dark";

function getSystemTheme(): Theme {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
    const [theme, setTheme] = useState<Theme>("light");

    const applyTheme = useCallback((value: Theme, persist: boolean) => {
        setTheme(value);
        document.documentElement.setAttribute("data-theme", value);
        if (persist) {
            window.localStorage.setItem(STORAGE_KEY, value);
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored === "light" || stored === "dark") {
            applyTheme(stored, true);
            return;
        }
        applyTheme(getSystemTheme(), false);
    }, [applyTheme]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = (event: MediaQueryListEvent) => {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) return;
            applyTheme(event.matches ? "dark" : "light", false);
        };
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [applyTheme]);

    const handleToggle = () => {
        applyTheme(theme === "light" ? "dark" : "light", true);
    };

    return (
        <button
            type="button"
            className={className}
            onClick={handleToggle}
            aria-label="Toggle color theme"
            aria-pressed={theme === "dark"}
        >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </button>
    );
}
