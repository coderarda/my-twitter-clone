import { useRouter } from "next/router";
import "../styles/globals.css";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { AppProps } from "next/app";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";

function NavigationContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session } = useSession();
    let str = router.pathname;

    return (
        <Auth0Provider>
            <div className="rootdiv">
                <NavigationMenu.Root className="navMenu" orientation="vertical">
                    <NavigationMenu.List className="navbarList">
                        <NavigationMenu.Item className="logo">{"<logo>"}</NavigationMenu.Item>
                        <NavigationMenu.Item className="item">
                            <NavigationMenu.Link className="link" active={str === "/"} href="/">
                                Home
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item className="item">
                            <NavigationMenu.Link
                                className="link"
                                active={str === "/explore"}
                                href="/explore"
                            >
                                Explore
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item className="item">
                            <NavigationMenu.Link
                                className="link"
                                active={str === "/notifications"}
                                href="/notifications"
                            >
                                Notifications
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        {!session ? (
                            <NavigationMenu.Item className="item">
                                <NavigationMenu.Link
                                    className="link"
                                    active={str === "/auth/signin"}
                                    href="/auth/signin"
                                >
                                    Sign In
                                </NavigationMenu.Link>
                            </NavigationMenu.Item>
                        ) : (
                            <NavigationMenu.Item className="item">
                                <NavigationMenu.Link
                                    className="linkButton link"
                                    active={str === "/auth/account"}
                                    href="/auth/account"
                                >
                                    Account
                                </NavigationMenu.Link>
                            </NavigationMenu.Item>
                        )}
                        <NavigationMenu.Item className="item">
                            <ThemeToggle className="navThemeToggle" />
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
                {children}
                <div className="sidebar"></div>
            </div>
        </Auth0Provider>
    );
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <NavigationContent>
                <Component {...pageProps} />
            </NavigationContent>
        </SessionProvider>
    );
}

export default MyApp;
