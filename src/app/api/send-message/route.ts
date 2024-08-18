
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


import { Message } from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();
    const { username, content } = await request.json();

    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return Response.json({
                success: false,
                message: "user not found",
            }, { status: 404 })
        }
        //IS USER IS ACCEPTING MESSSAGE
        if (!user.isAcceptingMessage) {
            return Response.json({
                success: false,
                message: "user is not accepting messages",
            }, { status: 500 })
        }
        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message);
        await user.save();
        return Response.json({
            success: true,
            message: "message sent succesfully",
        }, { status: 200 })
    } catch (error) {
        console.error("sending message failed", error);
        return Response.json({
            success: false,
            message: "message sent failed"
        }, { status: 500 })
    }

}