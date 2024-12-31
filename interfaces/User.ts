import { ObjectId } from "mongodb";

export default interface User {
  _id?: ObjectId;
  cards: UserCard[];
  clerk_id: string;
  display_name: string;
  email: string;
  email_verified?: boolean;
  groups: ObjectId[];
  picture?: string;
  username: string;
  username_modified?: Date;
}

export type UserCard = {
  _id: ObjectId;
  marked: boolean[];
  thumbnail?: string;
}

// export type UserGroup = {
//   _id: ObjectId;
//   creator: {
//     user_id: ObjectId;
//     username: string;
//   };
//   group_name: string;
//   thumbnail?: string;
// }
