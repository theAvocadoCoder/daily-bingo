import { ObjectId } from "mongodb";

type Role = "admin" | "super-admin" | "user";

export default interface Group {
  _id: ObjectId;
  cards: {
    _id: ObjectId;
    creator: {
      user_id: ObjectId;
      username: string;
    };
    card_name: string;
    thumbnail?: string;
  }[];
  creator: {
    user_id: ObjectId;
    username: string;
  };
  history: {
    message: string;
    attached: ObjectId[];
    sender: {
      user_id: string;
      username: string;
      picture: string;
    };
  }[];
  isDeleted: boolean;
  members: {
    user_id: ObjectId;
    username: string;
    role: Role;
  }[];
  name: string;
  references: number;
  picture?: string;
}
