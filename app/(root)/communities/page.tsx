import CommunityCard from "@/components/cards/CommunityCard";
import UserCard from "@/components/cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchAllUsers, fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async () => {

    // Check if there is a user
    const user = await currentUser();
    if (!user) {
        return null;
    };

    // Fetch the current user
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) {
        redirect("/onboarding");
    };

    // Fetch the communities
    const result = await fetchCommunities({
        searchString: "",
        pageNumber: 1,
        pageSize: 20,
    });

    return (
        <section>
            <h1 className="head-text mb-10">
                Search
            </h1>

            <div className="mt-14 flex flex-col gap-9">
                {result.communities.length === 0 ? (
                    <p className="no-result">
                        No users at the moment.
                    </p>
                ) : (
                    <>
                        {result.communities.map((communityItem) => (
                            <CommunityCard 
                                key={communityItem.id}
                                id={communityItem.id}
                                name={communityItem.name}
                                username={communityItem.username}
                                imgUrl={communityItem.image}
                                bio={communityItem.bio}
                                members={communityItem.members}
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    )
}

export default Page;