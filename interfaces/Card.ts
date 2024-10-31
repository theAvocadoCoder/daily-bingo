import { ObjectId } from "mongodb";
import type Cell from "./Cell";
import type { ISODateString } from "next-auth";

export default interface Card {
  _id: ObjectId;
  cells: Cell[];
  created_at: ISODateString;
  creator: {
    user_id: ObjectId;
    username: string;
  };
  isDeleted: boolean;
  name: string;
  references: number;
  saved?: boolean;
}