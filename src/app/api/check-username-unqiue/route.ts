import { NextRequest} from "next/server";
import { connectDb } from "@/lib/dbConect";
import User from "@/models/User";

export async function GET(request: NextRequest) {
    try {
        
        const { searchParams } = new URL(request.url);
        console.log(searchParams)
        const queryParams = {
          username: searchParams.get('username'),
        };

        if (!queryParams.username) {
          return Response.json(
            {
              success: false,
              message: 'Username not provided',
            },
            { status: 400 }
          );
        }

        await connectDb();

        
        const username = queryParams.username
    
        const existingVerifiedUser = await User.findOne({
          username
        });
    
        if (existingVerifiedUser) {
          return Response.json(
            {
              success: false,
              message: 'Username is already taken',
            },
            { status: 200 }
          );
        }
    
        return Response.json(
          {
            success: true,
            message: 'Username is unique',
          },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error checking username:', error);
        return Response.json(
          {
            success: false,
            message: 'Error checking username',
          },
          { status: 500 }
        );
      }

}