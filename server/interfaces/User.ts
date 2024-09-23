import { ObjectId } from "mongodb";

export default interface User {
  _id?: ObjectId;
  cards?: {
    created: ObjectId[];
    played: ObjectId[];
  };
  display_name?: string;
  email: string;
  email_verified?: boolean;
  groups?: {
    group_name: string;
    groupId: ObjectId;
  }[];
  username?: string;
  username_modified?: Date;
}
