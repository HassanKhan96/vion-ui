import { gql } from "@apollo/client";

export const GET_FRIENDS = gql`
  query GetFriends {
    myfriends {
      id
      username
      email
      avatar_url
      created_at
    }
  }
`;

export const FIND_USER_BY_EMAIL = gql`
  query FindUserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      username
      email
      avatar_url
      created_at
    }
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($toUserId: ID!) {
    sendFriendRequest(toUserId: $toUserId)
  }
`;
