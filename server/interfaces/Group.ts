import { ObjectId } from "mongodb";

export default interface Group {
  _id: ObjectId;
  members: {
    username: string;
    userId: ObjectId;
  }[];
  name: string;
}
