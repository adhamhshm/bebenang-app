"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validations/user";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";

// Import come from shadcn as it creates the component for us 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    user: {
        id: string,
        objectId: string,
        username: string,
        name: string,
        bio: string,
        image: string,
    },
    btnTitle: string,
};

const AccountProfile = ({ user, btnTitle }: Props) => {

    const router = useRouter();
    const pathname = usePathname();
    const [files, setFiles] = useState<File[]>([]);
    // Setup uploadThing by following the docs
    const { startUpload } = useUploadThing("media");
    
    const form = useForm({
        // Create the UserValidation in "/lib/validations/user.ts"
        resolver: zodResolver(UserValidation),
        defaultValues: {
            profile_photo: user?.image || "",
            name: user?.name || "",
            username: user?.username || "",
            bio: user?.bio || "",
        }
    });

    // Define image handler, to be intended to handle events related to image input fields, 
    // as indicated by the use of the ChangeEvent type.
    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void ) => {
        
        e.preventDefault();
        const fileReader = new FileReader();
        //e.target.files?.length
        //should be larger than 0 because we are using the array
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            setFiles(Array.from(e.target.files));

            if (!file.type.includes("image")) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";
                fieldChange(imageDataUrl);
            }
            fileReader.readAsDataURL(file);
        }
    };

    // Define a submit handler,  takes a single argument named values, which is 
    // expected to have a type that matches the inferred type from the UserValidation schema.
    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        // Do something with the form values.
        const blob = values.profile_photo;

        const hasImageChanged = isBase64Image(blob);
        if (hasImageChanged) {
            const imgRes = await startUpload(files);

            if (imgRes && imgRes[0].url) {
                values.profile_photo = imgRes[0].url;
            }
        }

        // Function to update user profile
        // if we pass like this, the parameter must follow accordingly to the function we created
        // await updateUser(user.id, values.username, values.name, values.bio, values.profile_photo, pathname);
        // this will also depends on how we create the function in the "/actions/user.actions.ts"

        // to ignore the arrangement, just pass via object
        await updateUser({
            userId: user.id,
            username: values.username,
            name: values.name,
            bio: values.bio,
            image: values.profile_photo,
            path: pathname,
        });

        if (pathname === "/profile/edit") {
            router.back();
        }
        else {
            router.push("/");
        }

    };

    return (
        // This Form can be obtained from shadcn installation docs
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col justify-start gap-10">
                {/* Form field for inserting profile photo */}
                <FormField
                    control={form.control}
                    name="profile_photo"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                            <FormLabel className="account-form_image-label">
                                {field.value ? (
                                    <Image 
                                        src={field.value} 
                                        alt="profile photo" 
                                        width={96} 
                                        height={96} 
                                        priority 
                                        className="rounded-full object contain"
                                    />
                                ) : (
                                    <Image 
                                        src="assets/profile.svg" 
                                        alt="profile photo" 
                                        width={24} 
                                        height={24} 
                                        className="object contain"
                                    />
                                )}
                            </FormLabel>
                            <FormControl className="flex-1 text-base-semibold text-gray-200">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    placeholder="Upload photo"
                                    className="account-form_image-input"
                                    onChange={(e) => handleImage(e, field.onChange)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form field for inserting name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-base-semibold text-light-2">
                                Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="account-form_input no-focus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form field for inserting username */}
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-base-semibold text-light-2">
                                Username
                            </FormLabel>
                            <FormControl className="flex-1 text-base-semibold text-gray-200">
                                <Input
                                    type="text"
                                    className="account-form_input no-focus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form field for inserting bio */}
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-base-semibold text-light-2">
                                Bio
                            </FormLabel>
                            <FormControl className="flex-1 text-base-semibold text-gray-200">
                                <Textarea
                                    rows={5}
                                    className="account-form_input no-focus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* The submit button for the form */}
                <Button type="submit" className="bg-primary-500">
                    Submit
                </Button>
            </form>
        </Form>
    )
};

export default AccountProfile;