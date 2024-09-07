import { ObjectId } from "mongodb";
import Cell from "./Cell";

export default interface Card {
  _id: ObjectId;
  cells: Cell[];
  createdAt: Date;
  creator?: ObjectId;
  groups: {
    groupName: string;
    groupId: ObjectId;
  }[];
}