import { graphql } from "../graphql-types";


export const GET_CONVERSATIONS = graphql(`
    query GetMyConversations {
        myConversations {
            conversation_id
            type
            created_at
            last_read_message_id
            last_message_id
            last_message
            last_message_at
            other_user_id
            username
        }
    }
`)

export const GET_MESSAGES = graphql(`
    query GetMessages($conversation_id: ID!) {
        getAllConversation(conversation_id: $conversation_id) {
            id
            conversation_id
            sender_id
            sender
            content
            created_at
            status
        }
    }
`)