import { authOptions } from "@/app/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not authenticated"
        }, { status: 401 })
    }
    const userId = user._id;
    const { acceptMessages } = await request.json();
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessage: acceptMessages }, { new: true })
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to update user status to accept message"
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            message: "updated user status to accept message", updatedUser
        }, { status: 200 })
    } catch (error) {
        console.error("failed to update user status to accept message", error)
        return Response.json({
            success: false,
            message: "failed to update user status to accept message"
        }, { status: 500 })
    }
}

export async function GET(request: Request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        const user: User = session?.user as User;
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "not authenticated"
            }, { status: 401 })
        }
        const userId = user._id;

        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "user not found"
            }, { status: 404 })
        }
        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            success: false,
            message: "failed to get user message acceptance status"
        }, { status: 401 })

    }
}