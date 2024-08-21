import { authOptions } from "@/app/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid;

    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not authenticated"
        }, { status: 401 })
    }

    try {
        const updateResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { message: { _id: messageId } } }
        )

        if (updateResult.modifiedCount == 0) {
            return Response.json({
                success: false,
                message: "message delete failed"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "message deleted succesfully"
        }, { status: 200 })
    } catch (error) {
        console.error("error deleting message", error);
        return Response.json({
            success: false,
            message: "error deleting message"
        }, { status: 500 })

    }

}