"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { connect } from "http2";
import Community from "../models/community.model";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
    try {
        connectToDB();
        // Find the community
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );
        const createdThread = await Thread.create({ text, author, community: communityIdObject });
        //Update User Model as they are the author of their own thread
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        });

         // Update User model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });
    
        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
            $push: { threads: createdThread._id },
            });
        }
    
        revalidatePath(path);    
    }
    catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`);
    }
};

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
    
    try {
        connectToDB();
        // Calculate the number of thread posts to skip
        const skipAmount = (pageNumber - 1) * pageSize;

        // Fetch posts that have no parents (top-level threads...)
        const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
            .sort({ _id: "desc" })
            .skip(skipAmount)
            .limit(pageSize)
            .populate({
                path: "author",
                model: User,
            })
            .populate({
                path: "community",
                model: Community,
            })
            .populate({
            path: "children", // Populate the children field
            populate: {
                path: "author", // Populate the author field within children
                model: User,
                select: "_id name parentId image", // Select only _id and username fields of the author
            },
        });

        const totalThreadsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined]}});
        const threads = await threadsQuery.exec();
        const isNext = totalThreadsCount > skipAmount + threads.length;
        return {threads, isNext };
    }
    catch (error: any) {
        throw new Error(`Error fetching threads: ${error.message}`);
    }
};

export async function fetchThreadById(threadId: string) {
    try {
        connectToDB();

        const thread = await Thread.findById(threadId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            }) // Populate the author field with _id and username
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            }) // Populate the community field with _id and name
            .populate({
                path: "children", // Populate the children field
                populate: [
                    {
                        path: "author", // Populate the author field within children
                        model: User,
                        select: "_id id name parentId image", // Select only _id and username fields of the author
                    },
                    {
                        path: "children", // Populate the children field within children
                        model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
                        populate: {
                            path: "author", // Populate the author field within nested children
                            model: User,
                            select: "_id id name parentId image", // Select only _id and username fields of the author
                        },
                },
            ],
        })
        .exec();

            return thread;
    }
    catch (error) {
        throw new Error(`Error fecthing threads by id: ${error}`);        
    }
};

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string) {
    try {
        connectToDB();
        // Find the original thread
        const originalThread = await Thread.findById(threadId);
        if (!originalThread) {
            throw new Error("Thread post not found.");
        }

        // Create a new thread with a comment text 
        const commentThread = new Thread({ text: commentText, author: userId, parentId: threadId});
        // Save the new thread
        const savedCommentThread = await commentThread.save();
        // Update the original thread to include the new comment
        originalThread.children.push(savedCommentThread._id);
        // Save the original thread
        await originalThread.save()

        revalidatePath(path);

    }
    catch (error: any) {
        throw new Error(`Error adding comment: ${error.message}`);
    }
};

export async function fetchUserThreads(userId: string) {
    try {
        connectToDB();
        // Find all threads authored by the user with the given userId
        //Todo: community stuff
        const threads = await User.findOne({ id: userId }).populate({
            path: "threads",
            model: Thread,
            populate: [
                {
                    path: "community",
                    model: Community,
                    select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                    path: "author",
                    model: User,
                    select: "name image id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
            ],
        });

        return threads;
    }
    catch (error: any) {
        throw new Error(`Error fetch user's threads: ${error.message}`);
    }
};