
import { graphql } from "../graphql-types";

export const GET_FRIENDS = graphql(`
    query getFriends {
        myfriends {
            id
            username
            email
            created_at
        }
    }  
`)