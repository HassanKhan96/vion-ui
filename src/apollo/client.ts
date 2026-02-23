
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { getConfig } from "../config/Application";
import { authTokenVar } from "./authVars";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client";
import api from "../lib/axios";

const { BASE_URL } = getConfig();

let isRefreshing = false;
let pendingRequests: ((callbacks: any) => void)[] = [];

const resolvePendingRequest = (token: string) => {
    pendingRequests.forEach((callback) => callback(token))
    pendingRequests = [];
}


const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (CombinedGraphQLErrors.is(error)) {
        for (const err of error.errors) {

            if (err?.extensions?.code === "UNAUTHORIZED") {

                if (isRefreshing) {
                    return new Observable((observer) => {

                        pendingRequests.push((token) => {
                            operation.setContext(({ headers = {} }) => ({
                                headers: {
                                    ...headers,
                                    Authorization: `Bearer ${token}`
                                }
                            }));
                            forward(operation).subscribe(observer)
                        })
                    })
                }

                isRefreshing = true;
                return new Observable((observer) => {
                    api.get('/auth/refresh-token')
                        .then(res => {
                            const token = res.data.accessToken;
                            authTokenVar(token);
                            operation.setContext(({ headers = {} }) => ({
                                headers: {
                                    ...headers,
                                    Authorization: `Bearer ${token}`
                                }
                            }));

                            resolvePendingRequest(token)

                            forward(operation).subscribe(observer);

                        })
                        .catch((error) => {
                            console.log(error);
                            pendingRequests = [];
                            api.get('/auth/logout')
                            observer.error(error);
                        })
                        .finally(() => {
                            isRefreshing = false;
                        })

                })
            }
        }
    }
})


const httpLink = new HttpLink({
    uri: `${BASE_URL}/graphql`,
    credentials: 'include'
});

const authLink = new SetContextLink(() => {
    const token = authTokenVar()

    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        }
    }
})



const client = new ApolloClient({
    link: ApolloLink.from([
        errorLink,
        authLink,
        httpLink
    ]),
    cache: new InMemoryCache(),
});

export default client;