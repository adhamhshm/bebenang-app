"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import { FilterQuery, SortOrder } from "mongoose";
import Thread from "../models/thread.model";

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
};

// This function takes several parameters, including userId, username, name, bio, 
// image, and path. These parameters appear to be used to update a user's information.
// The function is marked as asynchronous and returns a Promise<void>, indicating 
// that it will perform asynchronous operations.

// we may get the parameter like this but it can be a bit strict in the arrangement -->
// export async function updateUser(userId: string, username: string, name: string, bio: string, image: string, path: string)
// we can choose to pass by 6 parameters or just pass by 1 object (with any arrangement of its properties)
export async function updateUser({userId, username, name, bio, image, path}: Params): Promise<void> {
    connectToDB();

    try {
        // It uses Mongoose's findOneAndUpdate method on the User model to find 
        // a user with the specified userId and update their information.
        // The username is converted to lowercase using username.toLowerCase() before updating.
        // The name, bio, image, and onboarded fields are updated based on the provided values.
        // The { upsert: true } option indicates that if no user with the specified 
        // userId is found, a new user document should be created.
        await User.findOneAndUpdate(
            { id: userId}, 
            { username: username.toLowerCase(), name, bio, image, onboarded: true },
            { upsert: true },
        );

        // Allows you to revalidate data associated with a specific path. This is useful 
        // for scenarios where you want to update your cached data without waiting for a revalidation period to expire.
        if (path === "/profile/edit") {
            revalidatePath(path);
        };
    }
    catch (error: any) {
        throw new Error(`Error creating/updating user: ${error.message}`);
    }
};

export async function fetchUser(userId: string) {
    
    try {
        connectToDB();
        return await User.findOne({ id: userId })//.populate({ path: "communities", model: Community });
    }
    catch (error: any) {
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

export async function fetchAllUsers({ userId, searchString = "", pageNumber = 1, pageSize = 20, sortBy = "desc"} : { userId: string, searchString?: string, pageNumber?: number, pageSize?: number, sortBy?: SortOrder }) {
    try {
        connectToDB();
        const skipAmount = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString, "i");
        // the query with the FilterQuery
        const query : FilterQuery<typeof User> = {
            // not equal to user id, filter out the current user
            id: { $ne: userId }
        }
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ]
        }
        const sortOptions = { createdAt: sortBy };
        const allUsersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);
        const totalUsersCount = await User.countDocuments(query);
        const users = await allUsersQuery.exec();
        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    }
    catch (error: any) {
        throw new Error("Error fetching all users: ${error.message}")
    }
};

export async function getActivities(userId: string) {
    try {
        connectToDB();
        // Find all threads by the user
        const userThreads = await Thread.find({ author: userId });
        // Collect all the child threads ids (replies) from the children
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        },[]);
        const replies = await Thread.find({
            _id: { $in: childThreadIds},
            author: { $ne: userId }
        }).populate({
            path: "author",
            model: User,
            select: "name image _id",
        });

        return replies;
    }
    catch (error: any) {
        throw new Error(`Error getting the activities: ${error.message}`);
    }
};