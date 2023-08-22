import UserCard from "@/components/cards/UserCard";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";

export const communityTabs = [
    { value: "threads", label: "Threads", icon: "/assets/reply.svg" },
    { value: "members", label: "Members", icon: "/assets/members.svg" },
    { value: "requests", label: "Requests", icon: "/assets/request.svg" },
];
    
const Page = async ({ params }: { params: { id:  string } }) => {

    // Check if there is a user
    const user = await currentUser();
    if (!user) {
        return null;
    };

    // Get the community details
    const communityDetails = await fetchCommunityDetails(params.id);

    return (
        <section>
            <ProfileHeader
                accountId={communityDetails.id}
                authUserId={user.id}
                name={communityDetails.name}
                username={communityDetails.username}
                imgUrl={communityDetails.image}
                bio={communityDetails.bio}
                type="Community"
            />

            <div className="mt-2">
                <Tabs defaultValue="threads" className="w-full">
                    <TabsList className="tab">
                        {/* header for the tabs */}
                        {communityTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                <Image src={tab.icon} alt={tab.label} width={24} height={24} className="object-contain" />
                                <p className="max-sm:hidden">
                                    {tab.label}
                                </p>
                                {/* show total threads user had */}
                                {tab.label === "Threads" && (
                                    <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                                        {communityDetails?.threads?.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value="threads" className="w-full text-light-1" >
                        <ThreadsTab
                            currentUserId={user.id}
                            accountId={communityDetails._id}
                            accountType="Community"
                        />
                    </TabsContent>
                    <TabsContent value="members" className="w-full text-light-1" >
                        <section className="mt-9 flex flex-col gap-10">
                            {communityDetails?.members.map((member: any) => (
                                <UserCard
                                    key={member.id}
                                    id={member.id}
                                    name={member.name}
                                    username={member.username}
                                    imgUrl={member.image}
                                    itemType="User"
                                />
                            ))}
                        </section>
                    </TabsContent>
                    <TabsContent value="requests" className="w-full text-light-1" >
                        <ThreadsTab
                            currentUserId={user.id}
                            accountId={communityDetails.id}
                            accountType="User"
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    )
};

export default Page;