import UserCard from "@/components/cards/UserCard";
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

    // Fetch all users
    const result = await fetchAllUsers({
        userId: user.id,
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
                {result.users.length === 0 ? (
                    <p className="no-result">
                        No users at the moment.
                    </p>
                ) : (
                    <>
                        {result.users.map((userItem) => (
                            <UserCard 
                                key={userItem.id}
                                id={userItem.id}
                                name={userItem.name}
                                username={userItem.username}
                                imgUrl={userItem.image}
                                itemType="User"
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    )
}

export default Page;