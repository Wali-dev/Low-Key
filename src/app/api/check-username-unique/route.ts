import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";

import { usernameValidation } from "@/schemas/signUpSchema";


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {

    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get('username')
        }

        //VALIDATE WITH ZOD
        const result = UsernameQuerySchema.safeParse(queryParam);

        //check
        console.log(result)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "invalid query parameters"
            }, { status: 400 })
        }

        const { username } = result.data;

        const existingvVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingvVerifiedUser) {
            return Response.json({
                success: false,
                message: "username already taken"
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: "username available"
        }, { status: 200 })

    } catch (error) {
        console.error("error checking username", error);
        return Response.json({
            success: false,
            message: "error checking username"
        },
            {
                status: 500
            }
        )

    }

}