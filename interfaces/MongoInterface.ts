import type Card from "./Card";
import type Entry from "./Entry";
import type User from "./User";

export default interface MongoInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  findUser(id: string): Promise<User>;
  findUserByEmail(email: string): Promise<User>;
  insertUser(theUser: {email: string, username: string}): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  insertUserCard(id: string, card: string): Promise<User>;
  updateUserCard(id: string, data: string): Promise<User>;
  deleteUserCard(id: string, card: string): Promise<User>;
  findCard(id: string): Promise<Card>;
  insertCard(theCard: Partial<Card>): Promise<Card>;
  updateCard(id: string, card: Partial<Card>): Promise<Card>;
  findEntry(theme: string): Promise<Entry>;
}