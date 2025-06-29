import mongoose from "mongoose"
import { Connection } from "mongoose"

declare global{
    var mongoose: {
        conn: Connection | null
        promise: Promise<Connection> | null
    } | null
}

const MONGODB_URL = process.env.MONGODB_URL!;



if(!MONGODB_URL) {
    throw new Error("Please define mongodb uri in env")
}

let cachedConnection = global.mongoose;

if(!cachedConnection) {
    cachedConnection = global.mongoose = {conn:null, promise: null}
}

export async function connectDb() {
  if(cachedConnection?.conn){
    return cachedConnection.conn
  }  

  if(!cachedConnection?.promise) {
    const ops = {
        bufferCommands: true,
        maxPoolSize: 10,
        
    }

    cachedConnection!.promise =  mongoose.connect(MONGODB_URL, ops).then(()=> mongoose.connection)
  }

  try {
    cachedConnection!.conn = await cachedConnection!.promise
  } catch (error) {
    console.log(error);
    
    cachedConnection!.promise = null
    throw new Error("Error in dbConnect")
    
    
  }

  return cachedConnection?.conn
}
