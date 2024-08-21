/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import Messagecard from "@/components/Messagecard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form";

const Page = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    const { toast } = useToast();

    //IMPLEMENTING OPTIMISTIC UI METHOD WHERE UI IS UPDATED FIRSTLY AND BACKEND IS UPDATED LATER
    const handleDeleteMessage = async (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
    }

    const { data: session } = useSession();

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    })

    const { register, watch, setValue } = form;

    //IMPLEMENTING WATCH
    const acceptMessages = watch('acceptMessages')

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true);
        try {
            const response = axios.get('/api/accept-messages')
            setValue('acceptMessage', (await response).data.isAcceptingMessages)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch message setting",
                variant: "destructive"
            })
        } finally {
            setIsSwitchLoading(false)
        }

    }, [setValue])

    const fetchMessage = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true)
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages');
            setMessages(response.data.messages || [])
            toast({
                title: "Refreshed Messages",
                description: "Showing latest messages"
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch messages",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
            setIsSwitchLoading(false)
        }
    }, [setIsLoading, setMessages])

    useEffect(() => {
        if (!session || !session.user) return //NO NEED TO EXECUTE THE CODE FURTHER
        fetchMessage();
        fetchAcceptMessage();
    }, [session, setValue, fetchAcceptMessage, fetchMessage])

    //SWITCHING IS ACCEPTING MESSAGES OR NOT
    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages', {
                acceptMessages: !acceptMessages
            });
            setValue('acceptMessage', !acceptMessages)
            toast({
                title: response.data.message,
                variant: "default"

            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to change setting",
                variant: "destructive"
            })
        }
    }

    //CREATE A DYNAMIC URL
    const { username } = session?.user as User;
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username}`;

    //COPY TO CLIP BOARD METHOD
    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast({
            title: "Copied",
            description: "Profile url has been coppied"
        })
    }
    if (!session || !session.user) {
        return <div>Please login</div>
    }
    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessage(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <Messagecard
                            key={message._id}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>

    )
}

export default Page