import type Card from "./Card";
import type Entry from "./Entry";
import type User from "./User";

export default interface MongoInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  findUser(id: string): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  insertUser(theUser: {email: string, username: string}): Promise<User | null>;
  updateUser(id: string, data: any): Promise<User>;
  findCard(id: string): Promise<Card>;
  insertCard(id: string): Promise<Card>;
  updateCard(id: string, data: any, additionalFilters?: any): Promise<Card>;
  findEntry(theme: string): Promise<Entry>;
}