import { ObjectId } from "mongodb";

export default interface Entry {
  _id: ObjectId;
  phrases: string[];
  length: number;
  theme: "general" | "christmas"
}