import { ObjectId } from "mongodb";

export default interface User {
  _id?: ObjectId;
  cards: ObjectId[];
  clerk_id: string;
  display_name: string;
  email: string;
  email_verified?: boolean;
  groups: ObjectId[];
  picture?: string;
  username: string;
  username_modified?: Date;
}

// export type UserCard = {
//   _id: ObjectId | string;
//   creator: {
//     user_id: ObjectId | string;
//     username: string;
//   };
//   card_name: string;
//   isDeleted: boolean;
//   thumbnail?: string;
// }

// export type UserGroup = {
//   _id: ObjectId;
//   creator: {
//     user_id: ObjectId;
//     username: string;
//   };
//   group_name: string;
//   thumbnail?: string;
// }
