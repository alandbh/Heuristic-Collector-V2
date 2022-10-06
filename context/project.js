import { createContext, useContext } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";

const QUERY_CURRENT_PLAYER = gql`
    query getCurrentPlayer($projectSlug: String, $playerSlug: String) {
        players(where: { project: { slug: $projectSlug }, slug: $playerSlug }) {
            id
            name
        }
    }
`;

const QUERY_CURRENT_JOURNEY = gql`
    query getCurrentJourney($projectSlug: String, $journeySlug: String) {
        journeys(
            where: {
                project: { slug: $projectSlug }
                AND: { slug: $journeySlug }
            }
        ) {
            id
            slug
            name
        }
    }
`;

const ProjectContext = createContext();

export function ProjectWrapper({ children, data }) {
    const router = useRouter();

    const { slug, tab, player, journey } = router.query || "";

    const { data: currentPlayer, loading: loadingCurrentPlayer } = useQuery(
        QUERY_CURRENT_PLAYER,
        {
            variables: {
                playerSlug: player,
                projectSlug: slug,
            },
        }
    );
    const { data: currentJourney, loading: loadingCurrentJourney } = useQuery(
        QUERY_CURRENT_JOURNEY,
        {
            variables: {
                journeySlug: journey,
                projectSlug: slug,
            },
        }
    );

    if (loadingCurrentPlayer || loadingCurrentJourney) {
        return null;
    }

    // console.log("url", router.asPath.split("#").pop());
    console.log("currentPlayer", currentPlayer.players[0]);
    console.log("currentJourney", currentJourney.journeys[0]);

    return (
        <ProjectContext.Provider
            value={{
                project: data.project,
                currentPlayer: currentPlayer.players[0],
                currentJourney: currentJourney.journeys[0],
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjectContext() {
    return useContext(ProjectContext);
}
