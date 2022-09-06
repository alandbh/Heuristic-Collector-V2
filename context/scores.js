import { createContext, useContext, useEffect, useState } from "react";
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
            first: 1000
        ) {
            id
            scoreValue
            note
            evidenceUrl
            heuristic {
                heuristicNumber
                group {
                    name
                }
            }
        }
    }
`;

const ScoresContext = createContext();

export function ScoresWrapper({ children }) {
    const [allScores, setAllScores] = useState(null);
    const router = useRouter();
    const { data, loading, error } = useQuery(QUERY_SCORES, {
        variables: {
            projectSlug: router.query.slug,
            journeySlug: router.query.journey,
            playerSlug: router.query.player,
        },
    });

    useEffect(() => {
        if (data) {
            setAllScores(data.scores);
        }
    }, [data]);

    if (loading || !allScores) {
        return <div>LOADING</div>;
    }

    if (error) {
        return <div>SOMETHING WENT WRONG: {error.message}</div>;
    }
    if (data === undefined) {
        return null;
    }

    // console.log("SCORES", data);
    window.scores = data.scores;

    return (
        <ScoresContext.Provider value={{ allScores, setAllScores }}>
            {children}
        </ScoresContext.Provider>
    );
}

export function useScoresContext() {
    return useContext(ScoresContext);
}
