import { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import HeuristicGroup from "../HeuristicGroup";
import { useScoresContext } from "../../context/scores";

const QUERY_JOURNEYS = gql`
    query GetGroups($playerSlug: String, $projectSlug: String) {
        journeys(
            where: {
                players_some: {
                    slug: $playerSlug
                    project: { slug: $projectSlug }
                }
            }
        ) {
            name
            slug
        }
    }
`;

let selectedJourney;

export default function GroupContainer({ data }) {
    const router = useRouter();
    const { allScores } = useScoresContext();
    const {
        data: dataJourneys,
        loading,
        error,
    } = useQuery(QUERY_JOURNEYS, {
        variables: {
            playerSlug: router.query.player,
            projectSlug: router.query.slug,
        },
    });

    useEffect(() => {
        if (router.query.journey && dataJourneys) {
            selectedJourney = dataJourneys.journeys?.find(
                (journey) => journey.slug === router.query.journey
            );
            // console.log("SELECTED GROUP", selectedJourney);
        }
    }, [dataJourneys, router]);

    if (!allScores && !dataJourneys) {
        return null;
    }

    // console.log("GCONTAINER", data);

    if (!selectedJourney) {
        return (
            <div className="h-[calc(100vh_-_126px)] flex flex-col items-center px-5 text-center">
                <h1 className="text-2xl mb-5">
                    {`This player doens't have the selected journey.`}
                </h1>
                <p>Please, select another journey / player</p>
            </div>
        );
    }
    return (
        <>
            <div className="gap-5 max-w-5xl mx-auto md:grid grid-cols-3 ">
                <div className="md:col-span-2 flex flex-col gap-20">
                    {data.groups.map((group) => (
                        <HeuristicGroup group={group} key={group.id} />
                    ))}
                </div>
                <div>
                    <h1 className="text-2xl">Categories</h1>
                    {/* <Debugg data={allScores} /> */}
                </div>
            </div>
        </>
    );
}
