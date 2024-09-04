import { Document, ObjectId, WithId } from "mongodb";

export default interface User extends Document, WithId<Document> {
  _id: ObjectId;
  displayName: string;
  cards: {
    created: ObjectId[];
    played: ObjectId[];
  };
  groups: {
    groupName: string;
    groupId: ObjectId;
  }[];
  username: string;
}
