/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query GetMyConversations {\n        myConversations {\n            conversation_id\n            type\n            created_at\n            last_read_message_id\n            last_message_id\n            last_message\n            last_message_at\n            other_user_id\n            username\n        }\n    }\n": typeof types.GetMyConversationsDocument,
    "\n    query GetMessages($conversation_id: ID!) {\n        getAllConversation(conversation_id: $conversation_id) {\n            id\n            conversation_id\n            sender_id\n            sender\n            content\n            created_at\n            status\n        }\n    }\n": typeof types.GetMessagesDocument,
    "\n    query getFriends {\n        myfriends {\n            id\n            username\n            email\n            created_at\n        }\n    }  \n": typeof types.GetFriendsDocument,
    "\n    query GetCurrentUser {\n        me {\n            id\n            username\n            email\n            created_at\n        }\n    }\n": typeof types.GetCurrentUserDocument,
};
const documents: Documents = {
    "\n    query GetMyConversations {\n        myConversations {\n            conversation_id\n            type\n            created_at\n            last_read_message_id\n            last_message_id\n            last_message\n            last_message_at\n            other_user_id\n            username\n        }\n    }\n": types.GetMyConversationsDocument,
    "\n    query GetMessages($conversation_id: ID!) {\n        getAllConversation(conversation_id: $conversation_id) {\n            id\n            conversation_id\n            sender_id\n            sender\n            content\n            created_at\n            status\n        }\n    }\n": types.GetMessagesDocument,
    "\n    query getFriends {\n        myfriends {\n            id\n            username\n            email\n            created_at\n        }\n    }  \n": types.GetFriendsDocument,
    "\n    query GetCurrentUser {\n        me {\n            id\n            username\n            email\n            created_at\n        }\n    }\n": types.GetCurrentUserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetMyConversations {\n        myConversations {\n            conversation_id\n            type\n            created_at\n            last_read_message_id\n            last_message_id\n            last_message\n            last_message_at\n            other_user_id\n            username\n        }\n    }\n"): (typeof documents)["\n    query GetMyConversations {\n        myConversations {\n            conversation_id\n            type\n            created_at\n            last_read_message_id\n            last_message_id\n            last_message\n            last_message_at\n            other_user_id\n            username\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetMessages($conversation_id: ID!) {\n        getAllConversation(conversation_id: $conversation_id) {\n            id\n            conversation_id\n            sender_id\n            sender\n            content\n            created_at\n            status\n        }\n    }\n"): (typeof documents)["\n    query GetMessages($conversation_id: ID!) {\n        getAllConversation(conversation_id: $conversation_id) {\n            id\n            conversation_id\n            sender_id\n            sender\n            content\n            created_at\n            status\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query getFriends {\n        myfriends {\n            id\n            username\n            email\n            created_at\n        }\n    }  \n"): (typeof documents)["\n    query getFriends {\n        myfriends {\n            id\n            username\n            email\n            created_at\n        }\n    }  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetCurrentUser {\n        me {\n            id\n            username\n            email\n            created_at\n        }\n    }\n"): (typeof documents)["\n    query GetCurrentUser {\n        me {\n            id\n            username\n            email\n            created_at\n        }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;