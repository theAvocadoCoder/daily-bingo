import type Card from "./Card";
// import type Group from "./Group";
// import type { Message } from "./Group";
import type Entry from "./Entry";
import type User from "./User";
import type { UserCard } from "./User";

export default interface MongoInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  findUser(id: string): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByClerkId(id: string): Promise<User | null>;
  insertUser(theUser: {email: string, username: string}): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  insertUserCard(id: string, card: UserCard): Promise<User>;
  updateUserCard(id: string, card: string, marked: boolean[]): Promise<User>;
  deleteUserCard(id: string, card: string): Promise<User>;

  // insertUserGroup(id: string, group: string): Promise<User>;
  // updateUserGroup(id: string, data: string): Promise<User>;
  // deleteUserGroup(id: string, group: string): Promise<User>;

  findCard(id: string): Promise<Card>;
  insertCard(theCard: Partial<Card>): Promise<Card>;
  updateCard(id: string, card: Partial<Card>): Promise<Card>;
  updateCardReferences(id: string, operation: number): Promise<Card>;

  // findGroup(id: string): Promise<Group>;
  // insertGroup(theGroup: Partial<Group>): Promise<Group>;
  // updateGroup(id: string, group: Partial<Group>): Promise<Group>;
  // updateGroupReferences(id: string, operation: number): Promise<Group>;

  // insertGroupMessages(id: string, messages: Partial<Message>[]): Promise<Group>;

  findEntry(theme: string): Promise<Entry>;
}