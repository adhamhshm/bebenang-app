"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// import { updateUser } from "@/lib/actions/user.actions";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";
// import { createThread } from "@/lib/actions/thread.actions";

interface Props{
    threadId: string,
    currentUserImg: string,
    currentUserId: string,
};

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {

    const router = useRouter();
    const pathname = usePathname();
    
    const form = useForm({
        // Create the UserValidation in "/lib/validations/user.ts"
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: "",
        }
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        // create the function on "/lib/actions/thread.actions"
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname);
        // Reset the form
        form.reset();
        // Redirect the the home page
        router.push("/");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
                {/* Form field for replying a comment to the thread */}
                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className="flex w-full">
                            <FormLabel className="mt-2 mr-2 text-base-semibold text-light-2">
                                <Image src={currentUserImg} alt="profile image" width={48} height={48} className="rounded-full object-cover" />
                            </FormLabel>
                            <FormControl className="border-none bg-transparent">
                                <Textarea
                                    rows={1}
                                    placeholder="Comment..."
                                    className="no-focus text-light-1 outline-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="mt-3 flex justify-end">
                    {/* The submit button for the form */}
                    <Button type="submit" className="comment-form_btn">
                        Reply
                    </Button> 
                </div>
            </form>
        </Form>
    )
};

export default Comment;