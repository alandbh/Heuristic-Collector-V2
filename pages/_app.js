// import { ApolloProvider } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import client from "../lib/apollo";

import "../styles/globals.css";
if (typeof window !== "undefined") {
    if (localStorage.theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}
function MyApp({ Component, pageProps }) {
    return (
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}

export default MyApp;
