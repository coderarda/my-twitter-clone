import { useRouter } from "next/router";
import "../styles/globals.css";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { AppProps } from "next/app";
import { ThemeToggle } from "../components/ThemeToggle";
import { ClerkProvider, useUser } from "@clerk/nextjs";

function NavigationContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isSignedIn, user } = useUser();
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
                    <NavigationMenu.Item className="item">
                        {isSignedIn ? (
                            <NavigationMenu.Link
                                className="link"
                                active={str.startsWith("/profile")}
                                href={user?.username ? `/profile/${user.username}` : "/auth/account"}
                            >
                                Profile
                            </NavigationMenu.Link>
                        ) : null}
                    </NavigationMenu.Item>
                    <NavigationMenu.Item className="item">
                        {isSignedIn ? (
                            <NavigationMenu.Link
                                className="linkButton link"
                                active={str === "/auth/account"}
                                href="/auth/account"
                            >
                                Account
                            </NavigationMenu.Link>
                        ) : (
                            <NavigationMenu.Link
                                className="link"
                                active={str === "/auth/signin" || str === "/auth/signup"}
                                href="/auth/signin"
                            >
                                Log In or Sign Up
                            </NavigationMenu.Link>
                        )}
                    </NavigationMenu.Item>
                    <NavigationMenu.Item className="item">
                        <ThemeToggle className="navThemeToggle" />
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
            {children}
            <div className="sidebar"></div>
        </div>
    );
}

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ClerkProvider
            appearance={{ cssLayerName: "clerk" }}
            signInUrl="/auth/signin"
            signUpUrl="/auth/signup"
        >
            <NavigationContent>
                <Component {...pageProps} />
            </NavigationContent>
        </ClerkProvider>
    );
}

export default MyApp;
