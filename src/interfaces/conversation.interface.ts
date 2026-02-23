import type { PublicUser } from "../graphql-types/graphql";



export interface IConversation {
    current_participant: PublicUser | null;
    conversation_id: string | null;
}