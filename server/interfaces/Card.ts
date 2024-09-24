import { ObjectId } from "mongodb";
import Cell from "./Cell";

export default interface Card {
  _id: ObjectId;
  cells: Cell[];
  created_at: Date;
  creator?: {
    user_id: ObjectId;
    username: string;
  }
  groups: {
    group_name: string;
    group_id: ObjectId;
  }[];
}