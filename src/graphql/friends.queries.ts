import { gql } from "@apollo/client";

export const GET_PENDING_FRIEND_REQUESTS = gql`
  query GetPendingFriendRequests {
    myFriendRequests {
      id
      status
      created_at
      from {
        id
        username
        email
        avatar_url
        created_at
      }
    }
  }
`;

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

export const RESPOND_TO_FRIEND_REQUEST = gql`
  mutation RespondToFriendRequest($input: AcceptFriendRequest!) {
    acceptFriendRequest(input: $input)
  }
`;
