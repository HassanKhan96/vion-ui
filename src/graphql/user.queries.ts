

import { graphql } from "../graphql-types";


export const GET_CURRENT_USER = graphql(`
    query GetCurrentUser {
        me {
            id
            username
            email
            created_at
        }
    }
`);