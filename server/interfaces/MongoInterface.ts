export default interface MongoInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}