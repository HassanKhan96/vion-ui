/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AcceptFriendRequest = {
  requestId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};

export type Conversation = {
  __typename?: 'Conversation';
  conversation_id: Scalars['ID']['output'];
  created_at: Scalars['String']['output'];
  last_message?: Maybe<Scalars['String']['output']>;
  last_message_at?: Maybe<Scalars['String']['output']>;
  last_message_id?: Maybe<Scalars['String']['output']>;
  last_message_sender_id?: Maybe<Scalars['String']['output']>;
  last_message_status?: Maybe<Scalars['String']['output']>;
  last_read_message_id?: Maybe<Scalars['String']['output']>;
  other_user_id: Scalars['ID']['output'];
  type?: Maybe<Scalars['String']['output']>;
  unread_count: Scalars['Int']['output'];
  username: Scalars['String']['output'];
};

export type FriendRequest = {
  __typename?: 'FriendRequest';
  created_at: Scalars['String']['output'];
  from: PublicUser;
  id: Scalars['ID']['output'];
  status: Scalars['Boolean']['output'];
};

export type Message = {
  __typename?: 'Message';
  content: Scalars['String']['output'];
  conversation_id: Scalars['ID']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  sender: Scalars['String']['output'];
  sender_id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptFriendRequest: Scalars['String']['output'];
  sendFriendRequest: Scalars['String']['output'];
};


export type MutationAcceptFriendRequestArgs = {
  input: AcceptFriendRequest;
};


export type MutationSendFriendRequestArgs = {
  toUserId: Scalars['ID']['input'];
};

export type PublicUser = {
  __typename?: 'PublicUser';
  created_at: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllConversation: Array<Message>;
  me?: Maybe<PublicUser>;
  myConversations: Array<Conversation>;
  myFriendRequests: Array<FriendRequest>;
  myfriends: Array<PublicUser>;
  unFriend: Scalars['String']['output'];
  user?: Maybe<PublicUser>;
  userByEmail?: Maybe<PublicUser>;
};


export type QueryGetAllConversationArgs = {
  conversation_id: Scalars['ID']['input'];
};


export type QueryUnFriendArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  created_at: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  password: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type GetMyConversationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyConversationsQuery = { __typename?: 'Query', myConversations: Array<{ __typename?: 'Conversation', conversation_id: string, type?: string | null, created_at: string, unread_count: number, last_read_message_id?: string | null, last_message_id?: string | null, last_message_sender_id?: string | null, last_message_status?: string | null, last_message?: string | null, last_message_at?: string | null, other_user_id: string, username: string }> };

export type GetMessagesQueryVariables = Exact<{
  conversation_id: Scalars['ID']['input'];
}>;


export type GetMessagesQuery = { __typename?: 'Query', getAllConversation: Array<{ __typename?: 'Message', id: string, conversation_id: string, sender_id: string, sender: string, content: string, created_at: string, status: string }> };

export type GetFriendsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFriendsQuery = { __typename?: 'Query', myfriends: Array<{ __typename?: 'PublicUser', id: string, username: string, email: string, created_at: string }> };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', me?: { __typename?: 'PublicUser', id: string, username: string, email: string, created_at: string } | null };


export const GetMyConversationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyConversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myConversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversation_id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"unread_count"}},{"kind":"Field","name":{"kind":"Name","value":"last_read_message_id"}},{"kind":"Field","name":{"kind":"Name","value":"last_message_id"}},{"kind":"Field","name":{"kind":"Name","value":"last_message_sender_id"}},{"kind":"Field","name":{"kind":"Name","value":"last_message_status"}},{"kind":"Field","name":{"kind":"Name","value":"last_message"}},{"kind":"Field","name":{"kind":"Name","value":"last_message_at"}},{"kind":"Field","name":{"kind":"Name","value":"other_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<GetMyConversationsQuery, GetMyConversationsQueryVariables>;
export const GetMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"conversation_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"conversation_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"conversation_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conversation_id"}},{"kind":"Field","name":{"kind":"Name","value":"sender_id"}},{"kind":"Field","name":{"kind":"Name","value":"sender"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<GetMessagesQuery, GetMessagesQueryVariables>;
export const GetFriendsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getFriends"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myfriends"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<GetFriendsQuery, GetFriendsQueryVariables>;
export const GetCurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
