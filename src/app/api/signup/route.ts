import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();

        //CHECKING IS USER IS ON THE DB AND VERIFIED BY USERNAME
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "username is already taken"
            }, {
                status: 200
            })
        }

        //CHECKING IS USER IS ON THE DB BY EMAIL
        const existingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "user already exists with this email"
                }, { status: 400 }
                )
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                //UPDATING THE PASSWORD AND VERIFICATION CODE
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;

                const expireDate = new Date();
                expireDate.setHours(expireDate.getHours() + 1);

                existingUserByEmail.verifyCodeExpire = expireDate;

                existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expireDate = new Date();
            expireDate.setHours(expireDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpire: expireDate,
                isVerifyed: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save();
        }

        //SEND VERIFICATION EMAIL
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        //IF MAIL SENDING IS FAILED
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            },
                {
                    status: 500
                }
            )
        }

        //IF MAIL SEND SUCCESFULLY
        return Response.json({
            success: true,
            message: "user registered succesfully, please verify your email"
        },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("error registering user", error);
        return Response.json({
            success: false,
            message: "error registering user"
        },
            {
                status: 500
            }
        )
    }
}