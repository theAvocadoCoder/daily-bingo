import { ObjectId } from "mongodb";

export default interface User {
  _id?: ObjectId;
  cards?: {
    _id: ObjectId;
    created_by: {
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
    group_name: string;
    groupId: ObjectId;
  }[];
  picture?: string;
  username?: string;
  username_modified?: Date;
}
