import { ObjectId } from "mongodb";

type Role = "admin" | "super-admin" | "user";

export default interface Group {
  _id: ObjectId;
  cards?: {
    _id: ObjectId;
    created_by: {
      user_id: ObjectId;
      username: string;
    };
    card_name: string;
    thumbnail?: string;
  }[];
  created_by: {
    user_id: ObjectId;
    username: string;
  };
  history?: {
    message: string;
    attached: {
      _id: ObjectId;
      card_name: string;
    }[];
    sender: {
      user_id: string;
      username: string;
      picture: string;
    };
  }[];
  members: {
    user_id: ObjectId;
    username: string;
    role: Role;
  }[];
  name: string;
  thumbnail?: string;
}
