import Card from "./Card";
import Entry from "./Entry";
import User from "./User";

export default interface MongoInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  findUser(id: string): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  insertUser(theUser: {email: string, username: string}): Promise<User | null>;
  updateUser(id: string, data: any): Promise<User>;
  findCard(id: string): Promise<Card>;
  insertCard(id: string): Promise<Card>;
  findEntry(theme: string): Promise<Entry>;
}