"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { updateUser } from "@/lib/actions/user.actions";
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";

function PostThread({ userId }: { userId: string }) {

    const router = useRouter();
    const pathname = usePathname();
    
    const form = useForm({
        // Create the UserValidation in "/lib/validations/user.ts"
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            accountId: userId,
        }
    });

    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        // create the function on "/lib/actions/thread.actions"
        await createThread({
            text: values.thread,
            author: userId,
            communityId: null,
            path: pathname,
        })

        router.push("/");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col justify-start gap-10">
                {/* Form field for inserting content fo the thread */}
                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className="mt-10 text-base-semibold text-light-2">
                                Content
                            </FormLabel>
                            <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                                <Textarea
                                    rows={10}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                

                {/* The submit button for the form */}
                <Button type="submit" className="bg-primary-500">
                    Post
                </Button>
            </form>
        </Form>
    )
};

export default PostThread;