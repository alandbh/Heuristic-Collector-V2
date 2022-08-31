import { createContext, useContext } from "react";
import { useRouter } from "next/router";

import { gql, useQuery } from "@apollo/client";

const QUERY_SCORES = gql`
    query GetScores(
        $projectSlug: String
        $journeySlug: String
        $playerSlug: String
    ) {
        scores(
            where: {
                player: { slug: $playerSlug }
                project: { slug: $projectSlug }
                journey: { slug: $journeySlug }
            }
        ) {
            scoreValue
            note
            heuristic {
                heuristicNumber
            }
        }
    }
`;

const ScoresContext = createContext();

export function ScoresWrapper({ children }) {
    const router = useRouter();
    const { data, loading, error } = useQuery(QUERY_SCORES, {
        variables: {
            projectSlug: router.query.slug,
            journeySlug: router.query.journey,
            playerSlug: router.query.player,
        },
    });

    if (loading) {
        return <div>LOADING</div>;
    }

    if (error) {
        return <div>SOMETHING WENT WRONG: {error.message}</div>;
    }
    if (data === undefined) {
        return null;
    }

    return (
        <ScoresContext.Provider value={data}>{children}</ScoresContext.Provider>
    );
}

export function useScoresContext() {
    return useContext(ScoresContext);
}
