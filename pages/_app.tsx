import { useRouter } from "next/router";
import "../styles/globals.css";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
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
                </NavigationMenu.List>
            </NavigationMenu.Root>
            <Component {...pageProps} />
            <div className="sidebar"></div>
        </div>
    );
}

export default MyApp;
