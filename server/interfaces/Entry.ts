import { Document, ObjectId, WithId } from "mongodb";

export default interface Card extends Document, WithId<Document> {
  _id: ObjectId;
  phrases: string[];
  length: number;
  theme: "general" | "christmas"
}