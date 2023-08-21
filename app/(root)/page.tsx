import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Home() {

    const user = await currentUser();
    const result = await fetchThreads(1, 30);

    // Check if there is a user
    if (!user) {
        return null;
    };

    // Fetch the current user
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) {
        redirect("/onboarding");
    };

    return (
        <>
            <h1 className="head-text text-left">Home</h1>

            <section className="mt-9 flex flex-col gap-10">
                {result.threads.length === 0 ? (
                    <p className="no-result">No threads found.</p>
                ) : (
                    <>
                        {result.threads.map((thread) => (
                            <ThreadCard 
                                key={thread._id} 
                                id={thread._id} 
                                currentUserId={user?.id || ""} 
                                parentId={thread.parentId}
                                content={thread.text}
                                author={thread.author}
                                community={thread.community}
                                createdAt={thread.createdAt} 
                                comments={thread.children}
                            />
                        ))}
                    </>
                )}
            </section>
        </>
    )
};
