import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from 'zod';
import { verifySchema } from "@/schemas/verifySchema";

const VerifyCodeQuerySchema = z.object({
    verifyCode: verifySchema
})

export async function POST(request: Request) {
    await dbConnect();

    try {
        // const { searchParams } = new URL(request.url);
        // const queryParam = {
        //     verifyCode: searchParams.get('verifyCode')
        // }

        // //VERIFY USING ZOD 
        // const result = VerifyCodeQuerySchema.safeParse(queryParam);

        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username); //INCASE THE DATA FORM THE URL IS ENCODEDE

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json({
                success: false,
                message: "user not found"
            }, { status: 500 })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpire) > new Date;

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json({
                success: true,
                message: "account verified succesfully"
            }, { status: 200 })
        } else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "code expired, signup again to get a new code"
            }, { status: 400 })

        } else {
            return Response.json({
                success: false,
                message: "incorrect verification code"
            }, { status: 500 })
        }



    } catch (error) {
        console.error("error verifying user", error);
        return Response.json({
            success: false,
            message: "error verifying user"
        }, { status: 500 })
    }
}