import { resend } from '@/lib/resend';
import VerificationEmail from '../../emails/verificationEmails';
import { ApiResponse } from '@/types/apiResponse';

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Low key email verification',
            react: VerificationEmail({ username, otp: verifyCode })
        });
        return { success: true, message: "email verification send succesfully" }
    } catch (emailError) {
        console.error("error sending verification email", emailError);
        return { success: false, message: "email verification failed" }
    }
}
