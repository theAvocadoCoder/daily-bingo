import Card from "./Card";
import Entry from "./Entry";
import User from "./User";

export default interface MongoInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  findUser(id: string): Promise<User>;
  findCard(id: string): Promise<Card>;
  insertCard(id: string): Promise<Card>;
  findEntry(theme: string): Promise<Entry>;
}