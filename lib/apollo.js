import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const token = process.env.GRAPHCMS_PROD_AUTH_TOKEN;
const api = process.env.GRAPHCMS_PROJECT_API;

const httpLink = createHttpLink({
    uri: api,
    credentials: "include",
});

const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // const token = localStorage.getItem('token');
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

// const client = new ApolloClient({
//     // link: authMiddleware(process.env.GRAPHCMS_PROD_AUTH_TOKEN).concat(httpLink),
//     uri: process.env.GRAPHCMS_PROJECT_API,
//     headers: {
//         authorization: `Bearer ${process.env.GRAPHCMS_PROD_AUTH_TOKEN}`,
//     },
//     cache: new InMemoryCache(),
// });

const client = new ApolloClient({
    link: authLink.concat(httpLink), // Chain it with the HttpLink
    cache: new InMemoryCache(),
});

console.log("APIII", process.env.GRAPHCMS_PROJECT_API);

export default client;
