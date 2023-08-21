"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { connect } from "http2";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
    try {
        connectToDB();
        const createdThread = await Thread.create({ text, author, community: null });
        //Update User Model as they are the author of their own thread
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        });
    
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
        const threadsQuery = Thread.find({ parentId: { $in: [null, undefined]}})
            .sort({ _id: -1}) //using createdAt seems not working
            .skip(skipAmount)
            .limit(pageSize)
            .populate({ path: "author", model: User})
            .populate({ 
                path: "children",
                populate: {
                    path: "author",
                    model: User,
                    select: "_id name parentId image",
                }
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

        // Todo: populate with community
        const thread = await Thread.findById(threadId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image"
            })
            .populate({
                path: "children",
                populate: [
                    {
                        path: "author",
                        model: User,
                        select: "_id id name parentId image",
                    },
                    {
                        path: "children",
                        model: Thread,
                        populate: {
                            path:"author",
                            model: User,
                            select: "_id id name parentId image",
                        }
                    }
                ]
            }).exec();

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
            throw new Error("Thread post not found/available.");
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
        const threads = await User.findOne({ id: userId })
            .populate({
                path: "threads",
                model: Thread,
                populate: {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        select: "name image id",
                    }
                }
            })

        return threads;
    }
    catch (error: any) {
        throw new Error(`Error fetch user's threads: ${error.message}`);
    }
} 