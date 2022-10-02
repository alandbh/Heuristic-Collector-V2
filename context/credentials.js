import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import client from "../lib/apollo";
import { gql, useQuery } from "@apollo/client";
import { useUser } from "@auth0/nextjs-auth0";

const QUERY_USER = gql`
    query getRgaUser($projectSlug: String, $email: String) {
        rgaUser(where: { email: $email }) {
            email
            userType
            projects(where: { slug: $projectSlug }) {
                slug
            }
        }
    }
`;

const CredentialsContext = createContext();

async function getRgaUser(email, projectSlug, func) {
    const { data: userType } = await client.query({
        query: QUERY_USER,
        variables: {
            projectSlug,
            email,
        },
        fetchPolicy: "network-only",
    });

    // setAllScores(newData.scores);
    func(userType.rgaUser);
    console.log("RGA USER", userType);

    return userType.rgaUser;
}

export function CredentialsWrapper({ children }) {
    const [rgaUser, setRgaUser] = useState(null);
    const router = useRouter();
    const { user, error: errorUser, isLoading } = useUser();

    useEffect(() => {
        if (user) {
            getRgaUser(user.email, router.query.slug, setRgaUser);
        }
    }, [user, router.query.slug]);

    // const {
    //     data: userType,
    //     loading,
    //     error,
    // } = useQuery(QUERY_USER, {
    //     variables: {
    //         projectSlug: router.query.slug,
    //         email: user?.email,
    //     },
    // });

    if (!rgaUser) {
        return null;
    }

    console.log("userType", rgaUser?.userType);

    return (
        <CredentialsContext.Provider
            value={{ user, userType: rgaUser?.userType }}
        >
            {children}
        </CredentialsContext.Provider>
    );
}

export function useCredentialsContext() {
    return useContext(CredentialsContext);
}
