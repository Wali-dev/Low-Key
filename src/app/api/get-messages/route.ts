import { authOptions } from "@/app/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not authenticated"
        }, { status: 401 })
    }
    const userId = new mongoose.Types.ObjectId(user._id); //WE"LL GET USERID AS MONGOOSE OB ID, WHICH WILL NOT MAME ANY ISSUE IN AGGRIGASSION
    try {
        const user = await UserModel.aggregate([
            { $match: { id: userId } }, //TO MATCH DATA
            { $unwind: '$messages' }, //TO UNWIND ARRAY
            { $sort: { 'messages.createdAt': -1 } }, //TO SORT MESSAGES BY TIME
            { $group: { _id: '$_id', messages: { $push: '$messages' } } } //TO GROUP MESSAGE AS REQUIRED
        ])
        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "no message found for this user"
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            message: user[0].messages
        }, { status: 200 })
    } catch (error) {
        console.error("user messages fetching failed", error);
        return Response.json({
            success: false,
            message: "user messages fetching failed"
        }, { status: 401 })

    }
}