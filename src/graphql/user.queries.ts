import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      avatar_url
      created_at
    }
  }
`;

export const UPLOAD_MY_AVATAR = gql`
  mutation UploadMyAvatar($input: AvatarUploadInput!) {
    uploadMyAvatar(input: $input) {
      id
      username
      email
      avatar_url
      created_at
    }
  }
`;
