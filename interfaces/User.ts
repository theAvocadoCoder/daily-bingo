import { ObjectId } from "mongodb";

export default interface User {
  _id?: ObjectId;
  cards?: {
    _id: ObjectId;
    creator: {
      user_id: ObjectId;
      username: string;
    };
    card_name: string;
    thumbnail?: string;
  }[];
  display_name?: string;
  email: string;
  email_verified?: boolean;
  groups?: {
    _id: ObjectId;
    creator: {
      user_id: ObjectId;
      username: string;
    };
    group_name: string;
    thumbnail?: string;
  }[];
  picture?: string;
  username?: string;
  username_modified?: Date;
}
