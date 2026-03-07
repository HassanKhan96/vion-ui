import { gql } from "@apollo/client";


export const GET_CONVERSATIONS = gql`
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
      avatar_url
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($conversation_id: ID!, $limit: Int, $before: String) {
    getAllConversation(
      conversation_id: $conversation_id
      limit: $limit
      before: $before
    ) {
      id
      conversation_id
      sender_id
      sender
      content
      created_at
      status
    }
  }
`;

export const DELETE_MY_CONVERSATION = gql`
  mutation DeleteMyConversation($conversation_id: ID!) {
    deleteMyConversation(conversation_id: $conversation_id)
  }
`;
