import { Document, ObjectId, WithId } from "mongodb";

export default interface Group extends Document, WithId<Document> {
  _id: ObjectId;
  members: {
    username: string;
    userId: ObjectId;
  }[];
  name: string;
}
