import { ObjectId } from "mongodb";
import type Cell from "./Cell";

export default interface Card {
  _id: ObjectId;
  cells: Cell[];
  created_at: Date;
  creator: {
    user_id: ObjectId;
    username: string;
  };
  isDeleted: boolean;
  name: string;
  references: number;
  saved?: boolean;
}