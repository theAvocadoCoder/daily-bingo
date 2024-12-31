/***********************************************
 * Class MongoIO implements all mongodb I-O
 */
import { Collection, Db, InsertOneResult, MongoClient, ObjectId, OptionalId, UpdateFilter, ServerApiVersion } from "mongodb";
import MongoInterface from "~/interfaces/MongoInterface";
import User, { UserCard } from "~/interfaces/User";
import Card from "~/interfaces/Card";
import Group, { Message } from "~/interfaces/Group";
import Entry from "~/interfaces/Entry";

const { dbName: runtimeDbName } = useRuntimeConfig();

/*************************************************
 * Class Properties
 */
export default class MongoIO implements MongoInterface {
  private isConnected?: boolean;
  private client?: MongoClient;
  private db?: Db;
  private userCollection?: Collection<Partial<User>>;
  private cardCollection?: Collection<Partial<Card>>;
  private groupCollection?: Collection<Partial<Group>>;
  private entryCollection?: Collection<Partial<Entry>>;

  /*************************************************
   * Constructor
   */
  constructor() {}

  /***************************************************
   * Connect to mongodb database
   */
  public async connect(): Promise<void> {

    if (this.client) return;

    const dbName = runtimeDbName;
    const connectionString = process.env.ATLAS_URI as string;

    this.client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 7500, // Wait up to 7.5 seconds for server selection
      connectTimeoutMS: 10000,       // Wait up to 10 seconds for the connection
    });

    try {
      await this.client!.connect().then(() => {
        this.db = this.client!.db(dbName);
        this.userCollection = this.db.collection("users");
        this.cardCollection = this.db.collection("cards");
        this.groupCollection = this.db.collection("groups");
        this.entryCollection = this.db.collection("entries");
        console.info("Database", dbName, "Connected");
      })

    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      this.isConnected = false;
    }
  }

  /***************************************************
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      this.db = undefined;
      this.isConnected = false;
    }
  }

  /****************************************************
   * Get user
   * 
   * @param {string} id the user's ID
   * 
   * @returns {Promise<User>} the found user
   */
  public async findUser(id: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    const userId = new ObjectId(id);
    const pipeline = [
      {$match: {_id: userId}}
    ]

    const results = await this.userCollection.aggregate<User>(pipeline).next();

    if (results === null) {
      throw new Error("User not found: " + id);
    } else {
      return results;
    }
  }

  /****************************************************
   * Get user by their email address
   * 
   * @param {string} email the user's email
   * 
   * @returns {Promise<User>} the found user
   */
  public async findUserByEmail(email: string): Promise<User | null> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    
    const pipeline = [
      {$match: {email: email}}
    ]

    const results = await this.userCollection.aggregate<User>(pipeline).next();

    if (results === null) {
      console.log("User not found: ", email);
      return null;
    } else {
      return results;
    }
  }

  /****************************************************
   * Get user by their email address
   * 
   * @param {string} email the user's email
   * 
   * @returns {Promise<User>} the found user
   */
  public async findUserByClerkId(id: string): Promise<User | null> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    
    const pipeline = [
      {$match: {clerk_id: id}}
    ]

    const results = await this.userCollection.aggregate<User>(pipeline).next();

    if (results === null) {
      console.log("User not found: ", id);
      return null;
    } else {
      return results;
    }
  }

  /****************************************************
   * Insert a new user
   * 
   * @param {Partial<User>} theUser the new user to insert
   * 
   * @returns {Promise<User>} the newly inserted user
   */
  public async insertUser(theUser: Partial<User>): Promise<User> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    
    let results: InsertOneResult;
    const newUser: OptionalId<Partial<User>> = {
      ...theUser,
    };

    results = await this.userCollection.insertOne(newUser);
    const id = results.insertedId.toHexString();

    const insertedUser = await this.findUser(id);

    if (insertedUser === null || results === null) {
      throw new Error("Could not add new user");
    } else {
      return insertedUser;
    }
  }

  /********************************************************************************
   * Update a user by ID
   * 
   * @param {string} id the user's id
   * @param {Partial<User>} data the fields to update
   * 
   * @returns {Promise<User>} the updated user
   */
  public async updateUser(id: string, data: Partial<User>): Promise<User> {
    if (!this.userCollection) {
      throw new Error("updateUser - Database not connected");
    }

    const MS_PER_MONTH = 2_629_746_000;

    const user = await this.findUser(id);

    // Check if username was changed in the past 30 days
    if (
      data.username &&
      user.username_modified &&
      Date.now() - Date.parse(user.username_modified?.toDateString()) < MS_PER_MONTH
    ) {
      throw new Error("Username can only be updated once every 30 days");
    }

    const userId = new ObjectId(id);
    const filter = { _id: userId };
    const update = { $set: data };

    const result = await this.userCollection.updateOne(filter, update);

    console.info("User %s updated with %s", userId, data);

    if (!result) {
      throw new Error("Update User found No User to Update " + userId);
    }

    return await this.findUser(id);
  }

  /***********************************************
   * Add a card to the user's collection
   * 
   * @param {string} id the user's id
   * @param {string} card the card to be added
   * 
   * @returns {Promise<User>} the updated user
   */
  public async insertUserCard(id: string, card: UserCard): Promise<User> {
    if (!this.userCollection) {
      throw new Error("insertUserCard - Database not connected");
    }

    const userId = new ObjectId(id);
    const cardId = new ObjectId(card._id);
    const filter = { _id: userId };
    const update = { $addToSet: { cards: {...card, _id: cardId} } };

    const result = await this.userCollection.updateOne(filter, update);

    if (!result) {
      throw new Error("Update User found No User to Update " + userId);
    } else {
      console.info("User %s updated with new card %s", userId, card);
      return await this.findUser(id);
    }
  }

  /***********************************************
   * Update a User's saved cards 
   * 
   * @param {string} id the user's id
   * @param {string} card the id of the card to edit
   * @param {number} marked the array of cell markings
   * 
   * @returns {Promise<User>} the updated user
   */
  public async updateUserCard(id: string, card: string, marked: boolean[]): Promise<User> {
    if (!this.userCollection) {
      throw new Error("updateUser - Database not connected");
    }

    const userId = new ObjectId(id);
    const cardId = new ObjectId(card);
    const filter = { _id: userId, "cards._id": cardId };
    const update = { $set: { "cards.$.marked": marked } };

    const result = await this.userCollection.updateOne(filter, update);

    console.log("update user card result:", result)

    if (!result) {
      throw new Error("Could not update card for user " + userId);
    } else {
      console.info("User %s's card updated with %s", userId, card);
      return await this.findUser(id);
    }
  }

  /************************************************
   * Delete a card from user's collection
   * 
   * @param {string} id the user's id
   * @param {string} card the card to be deleted
   * 
   * @returns {Promise<User>} the updated user
   */
  public async deleteUserCard(id: string, card: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("updateUser - Database not connected");
    }

    const userId = new ObjectId(id);
    const userCardId = new ObjectId(card);

    const filter = { _id: userId };
    const update = { $pull: {
      cards: { _id: userCardId }
    } };

    const result = await this.userCollection.updateOne(filter, update);

    if (!result) {
      throw new Error("Could not delete the card");
    } else {
      console.info("User %s's card %s deleted", userId, card);
      return await this.findUser(id);
    }
  }

  /***********************************************
   * Add a group to the user's collection
   * 
   * @param {string} id the user's id
   * @param {string} group the group to be added
   * 
   * @returns {Promise<User>} the updated user
   */
  public async insertUserGroup(id: string, group: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("insertUserGroup - Database not connected");
    }

    const user_id = new ObjectId(id);
    const group_id = new ObjectId(group);
    const filter = { _id: user_id };
    const update = { $addToSet: { groups: group_id } };

    const result = await this.userCollection.updateOne(filter, update);

    if (!result) {
      throw new Error("insertUserGroup - Could not insert new user group");
    } else {
      console.info("User %s updated with new group %s", user_id, group_id);
      return await this.findUser(id);
    }
  }

  /***********************************************f
   * Update a user's saved groups
   * 
   * @param {string} id the user's id
   * @param {string} group the data in the group to edit
   * 
   * @returns {Promise<User>} the updated user
   */
  public async updateUserGroup(id: string, group: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("updateUserGroup - Database not connected");
    }

    const [field, value] = Object.entries(group)[0] as [keyof User, any];

    const user_id = new ObjectId(id);
    const group_id = new ObjectId(group);
    const filter = { _id: user_id, "groups._id": group_id };
    const update = Array.isArray(value) ?
      { $addToSet: { [`groups.$.${field}`]: value } } :
      { $set: { [`groups.$.${field}`]: value } };

    const result = await this.userCollection.updateOne(filter, update);

    if (!result) {
      throw new Error("Could not update group for user " + user_id);
    } else {
      console.info("User %s's group updated with %s", user_id, group_id);
      return await this.findUser(id);
    }
  }

  /***********************************************
   * Delete a group from user's collection
   * 
   * @param {string} id the user's id
   * @param {string} group the group to be deleted
   * 
   * @returns {Promise<User>} the updated user
   */
  public async deleteUserGroup(id: string, group: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("deleteUserGroup - Database not connected");
    }

    const user_id = new ObjectId(id);
    const group_id = new ObjectId(group);

    const filter = { _id: user_id };
    const update = { $pull: {
      groups: group_id
    } };

    const result = await this.userCollection.updateOne(filter, update);

    if (!result) {
      throw new Error("Could not delete the group");
    } else {
      console.info("User %s's group %s deleted", user_id, group_id);
      return await this.findUser(id);
    }
  }

  /***********************************************
   * Get a card
   * 
   * @param {string} id the card id
   * 
   * @returns {Promise<Card>} the found card
   */
  public async findCard(id: string): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("findCard - Database not connected");
    }

    const cardId = new ObjectId(id);
    const pipeline = [
      {$match: {_id: cardId}}
    ]

    const results = await this.cardCollection.aggregate<Card>(pipeline).next();

    if (results === null) {
      throw new Error("Card not found: " + id);
    } else {
      console.info("Found card %s", cardId);
      return results;
    }
  }

  /****************************************************
   * Get cards
   * 
   * @param {string[]} ids the IDs to find
   * 
   * @returns {Promise<Partial<Card>[]>} an array of the found cards
   */
  public async findCards(ids: UserCard[]): Promise<Partial<Card>[]> {
    if (!this.cardCollection) {
      throw new Error("findCards - Database not connected");
    }

    const idsLength = ids.length;
    const cardIds = [];

    for (let i = 0; i < idsLength; i++) {
      cardIds.push(new ObjectId(ids[i]._id));
    }

    const cursor = this.cardCollection.find({ _id: { $in: cardIds } });
    const results = await cursor.toArray();

    if (!results) {
      throw new Error("Could not retrieve user's cards");
    } else {
      console.info("Found user's cards");
      return results;
    }
  }

  /****************************************************
   * Insert a new card
   * 
   * @param {Partial<Card>} theCard the card to be inserted
   * 
   * @returns {Promise<Card>} the inserted card
   */
  public async insertCard(theCard: Partial<Card>): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("insertCard - Database not connected");
    }

    const results = await this.cardCollection.insertOne(theCard);
    let id = results.insertedId.toHexString();

    if (results === null) {
      throw new Error("Could not update card: " + id);
    } else {
      console.info("Card %s inserted", id);
      return await this.findCard(id);
    }
  } 

  /********************************************************************************
   * Update a card by ID
   * 
   * @param {string} id the card id
   * @param {Partial<Card>} card to update
   * 
   * @returns {Promise<Card>} Updated card
   */
  public async updateCard(id: string, card: Partial<Card>): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("updateCard - Database not connected");
    }

    const card_id = new ObjectId(id);
    const filter = { _id: card_id };
    const update = { $set: card };

    const result = await this.cardCollection.findOneAndUpdate(filter, update);
    if (!result) {
      throw new Error("Update card found No Card to Update " + card_id);
    } else {
      console.info("Card %s updated with %s", card_id, card);
      return await this.findCard(id);
    }
  }

  /**************************************************************
   * Increment or decrement the card's references
   * 
   * @param {string} id the card id
   * @param {number} operation whether to increment or decrement the references
   * 
   * @returns {Promise<Card>} the updated card
   */
  public async updateCardReferences(id: string, operation: number): Promise<Card> {
    if (!this.cardCollection) {
      throw new Error("updateCardReferences - Database not connected");
    }
    
    const card_id = new ObjectId(id);
    const filter = { _id: card_id };
    const update = { $inc: {
      references: operation,
    } };

    const result = await this.cardCollection.findOneAndUpdate(filter, update);

    if (!result) { 
      throw new Error("Update card found No Card to Update " + card_id);
    } else {
      console.info("Card %s's reference updated", card_id);
      return await this.findCard(id);
    }
  }

  /**************************************************************
   * Get a group
   * 
   * @param {string} id the group id
   * 
   * @returns {Promise<Group>} the found group
   */
  public async findGroup(id: string): Promise<Group> {
    if (!this.groupCollection) {
      throw new Error("findGroup - Database not connected");
    }

    const groupId = new ObjectId(id);
    const pipeline = [
      {$match: {_id: groupId}}
    ];

    const results = await this.groupCollection.aggregate<Group>(pipeline).next();

    if (results === null) {
      throw new Error("Group not found: " + id);
    } else {
      console.info("Found group %s", groupId);
      return results;
    }
  }

  /***************************************************************
   * Get groups
   * 
   * @param {string[]} ids the IDs to find
   * 
   * @returns {Promise<Partial<Group>[]>} an array of the found groups
   */
  public async findGroups(ids: string[]): Promise<Partial<Group>[]> {
    if (!this.groupCollection) {
      throw new Error("findGroups - Database not connected");
    }

    const idsLength = ids.length;
    const groupIds = [];

    for (let i = 0; i < idsLength; i++) {
      groupIds.push(new ObjectId(ids[i]));
    }

    const cursor = this.groupCollection.find({ _id: { $in: groupIds } });
    const results = await cursor.toArray();

    if (!results) {
      throw new Error("Could not retrieve user's groups");
    } else {
      console.info("Found user's groups");
      return results;
    }
  }

  /***************************************************************
   * Insert a new group
   * 
   * @param {Partial<Group>} theGroup the group to be inserted
   * 
   * @returns {Promise<Group>} the inserted group
   */
  public async insertGroup(theGroup: Partial<Group>): Promise<Group> {
    if (!this.groupCollection) {
      throw new Error("insertGroup - Database not connected");
    }

    const results = await this.groupCollection.insertOne(theGroup);
    let id = results.insertedId.toHexString();

    if (results === null) {
      throw new Error("Could not update group: " + id);
    } else {
      console.info("Group %s inserted", id);
      return await this.findGroup(id);
    }
  }

  /***************************************************************
   * Update a group by ID
   * 
   * @param {string} id the group id
   * @param {Partial<Group>} group to update
   * 
   * @returns {Promise<Group>} Updated group
   */
  public async updateGroup(id: string, group: Partial<Group>): Promise<Group> {
    if (!this.groupCollection) {
      throw new Error("updateGroup - Database not connected");
    }

    const group_id = new ObjectId(id);
    const filter = { _id: group_id };
    const update = { $set: group };

    const result = await this.groupCollection.findOneAndUpdate(filter, update);
    if (!result) {
      throw new Error("Update group found No Group to Update " + group_id);
    } else {
      console.info ("Group %s updated with %s", group_id, group);
      return await this.findGroup(id);
    }
  }

  /***************************************************************
   * Increment or decrement the group's references
   * 
   * @param {string} id the group id
   * @param {1 | -1} operation whether to increment or decrement the references
   * 
   * @returns {<Promise<Group>>}
   */
  public async updateGroupReferences(id: string, operation: 1 | -1): Promise<Group> {
    if (!this.groupCollection) {
      throw new Error("updateGroupReferences - Database not connected");
    }

    const group_id = new ObjectId(id);
    const filter = { _id: group_id };
    const update = { $inc: {
      references: operation,
    } };

    const result = await this.groupCollection.findOneAndUpdate(filter, update);

    if (!result) {
      throw new Error("Update group references found no group to update " + group_id);
    } else {
      console.info("Group %s's reference updated", group_id);
      return await this.findGroup(id);
    }
  }

  /*************************************************************** 
   * Add message(s) to the group history
   * 
   * @param {string} id the group id
   * @param {Partial<Message>[]} messages the messages to insert
  */
  public async insertGroupMessages(id: string, messages: Partial<Message>[]): Promise<Group> {
    if (!this.groupCollection) {
      throw new Error("insertGroupMessages - Database not connected");
    }

    const group_id = new ObjectId(id);
    const filter = { _id: group_id };
    const updateField: UpdateFilter<Partial<Group>> = { history: { $each: messages } };
    const update = { $push: updateField };

    const result = await this.groupCollection.updateOne(filter, update);
    if (!result) {
      throw new Error("Insert group mesaages found No Group to Update " + group_id);
    } else {
      console.info ("Group %s updated with %s", group_id, `${messages[0]}...`);
      return await this.findGroup(id);
    }
  }

  /***************************************************************
   * Get phrases
   * 
   * @param {string} theme the entry's theme
   * 
   * @returns {Promise<Entry>} the found entry
   */
  public async findEntry(theme: string): Promise<Entry> {
    if (!this.entryCollection) {
      throw new Error("findEntry - Database not connected");
    }

    const pipeline = [
      {$match: {theme: theme}}
    ]

    let results: Entry | null;
    results = await this.entryCollection.aggregate<Entry>(pipeline).next();

    if (results === null) {
      throw new Error("Entry not found: " + theme);
    } else {
      console.info("Entry %s retrieved", theme);
      return results;
    }
  }
}
