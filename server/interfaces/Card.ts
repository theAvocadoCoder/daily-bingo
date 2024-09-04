import { Document, ObjectId, WithId } from "mongodb";
import Cell from "./Cell";

export default interface Card extends Document, WithId<Document> {
  _id: ObjectId;
  cells: Cell[];
  createdAt: Date;
  creator?: ObjectId;
  groups: {
    groupName: string;
    groupId: ObjectId;
  }[];
}