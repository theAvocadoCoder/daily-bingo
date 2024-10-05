/***********************************************
 * Class MongoIO implements all mongodb I-O
 */
import { Collection, Db, InsertOneResult, MongoClient, ObjectId, OptionalId } from "mongodb";
import MongoInterface from "~/interfaces/MongoInterface";
import User from "~/interfaces/User";
import Card from "~/interfaces/Card";
import Entry from "~/interfaces/Entry";

/*************************************************
 * Class Properties
 */
export default class MongoIO implements MongoInterface {
  private client?: MongoClient;
  private db?: Db;
  private userCollection?: Collection<Partial<User>>;
  private cardCollection?: Collection<Partial<Card>>;
  private entryCollection?: Collection<Partial<Entry>>;

  /*************************************************
   * Constructor
   */
  constructor() {}

  /***************************************************
   * Connect to mongodb database
   */
  public async connect(): Promise<void> {
    const connectionString = process.env.ATLAS_URI as string;
    const dbName = process.env.DB_NAME;

    this.client = new MongoClient(connectionString);
    await this.client.connect();
    this.db = this.client.db(dbName);
    this.userCollection = this.db.collection("users");
    this.cardCollection = this.db.collection("cards");
    this.entryCollection = this.db.collection("entries");

    console.info("Database", dbName, "Connected");
  }

  /***************************************************
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      this.db = undefined;
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
  public async findUserByEmail(email: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("findUser - Database not connected");
    }
    
    const pipeline = [
      {$match: {email: email}}
    ]

    const results = await this.userCollection.aggregate<User>(pipeline).next();

    if (results === null) {
      throw new Error("User not found: " + email);
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

    const randomFourDigits = Math.floor(Math.random() * 10000);
    
    let results: InsertOneResult;
    const newUser: OptionalId<Partial<User>> = {
      ...theUser,
      display_name: `User${randomFourDigits}`,
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

    return this.findUser(id);
  }

  /***********************************************
   * Add a card to the user's collection
   * 
   * @param {string} id the user's id
   * @param {string} card the card to be added
   * 
   * @returns {Promise<User>} the updated user
   */
  public async insertUserCard(id: string, card: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("updateUser - Database not connected");
    }

    const userId = new ObjectId(id);
    const cardId = new ObjectId(card);
    const filter = { _id: userId };
    const update = { $addToSet: { cards: cardId } };

    const result = await this.userCollection.updateOne(filter, update);

    if (!result) {
      throw new Error("Update User found No User to Update " + userId);
    } else {
      console.info("User %s updated with new card %s", userId, card);
      return this.findUser(id);
    }
  }

  /***********************************************
   * Update a User's saved cards 
   * 
   * @param {string} id the user's id
   * @param {string} card the data in the card to edit
   * 
   * @returns {Promise<User>} the updated user
   */
  public async updateUserCard(id: string, card: string): Promise<User> {
    if (!this.userCollection) {
      throw new Error("updateUser - Database not connected");
    }
    
    const [field, value] = Object.entries(card)[0] as [keyof User, any];

    const userId = new ObjectId(id);
    const cardId = new ObjectId(card);
    const filter = { _id: userId, "cards._id": cardId };
    const update = Array.isArray(value) ?
      { $addToSet: { [`cards.$.${field}`]: value } } :
      { $set: { [`cards.$.${field}`]: value } };

    const result = await this.userCollection.updateOne(filter, update);


    if (!result) {
      throw new Error("Could not update card for user " + userId);
    } else {
      console.info("User %s's card updated with %s", userId, card);
      return this.findUser(id);
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
      cards: userCardId
    } };

    const result = await this.userCollection.updateOne(filter, update);

    if (!result) {
      throw new Error("Could not delete the card");
    } else {
      console.info("User %s's card %s deleted", userId, card);
      return this.findUser(id);
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
  public async findCards(ids: string[]): Promise<Partial<Card>[]> {
    if (!this.cardCollection) {
      throw new Error("findCard - Database not connected");
    }

    const idsLength = ids.length;
    const cardIds = [];

    for (let i = 0; i < idsLength; i++) {
      cardIds.push(new ObjectId(ids[i]));
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
   * @param {string} id the crad id
   * @param {Partial<Card>} card to update
   * 
   * @returns Updated card
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
      throw new Error("Update card found No Card to Update " + cardId);
    }

    return this.findCard(id);
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
