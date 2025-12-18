import { useRouter } from "next/router";
import "../styles/globals.css";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { AppProps } from "next/app";
import { SessionProvider, useSession, signOut } from "next-auth/react";

function NavigationContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session } = useSession();
    let str = router.pathname;

    return (
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
                            <button
                                className="link"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Sign Out
                            </button>
                        </NavigationMenu.Item>
                    )}
                </NavigationMenu.List>
            </NavigationMenu.Root>
            {children}
            <div className="sidebar"></div>
        </div>
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
