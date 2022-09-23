import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import client from "../../lib/apollo";

import Debugg from "../../lib/Debugg";
import Donnut from "../Donnut";
import Progress from "../Progress";

const QUERY_SCORES = gql`
    query GetScores(
        $projectSlug: String # $journeySlug: String # $playerSlug: String
    ) {
        scores(
            where: {
                # player: { slug: $playerSlug }
                project: { slug: $projectSlug }
                # journey: { slug: $journeySlug }
            }
            first: 1000
        ) {
            id
            scoreValue
            journey {
                slug
                name
            }
            player {
                name
                slug
            }
            heuristic {
                heuristicNumber
                group {
                    name
                }
            }
        }
    }
`;

function getZeroedScores(scores, journey, player) {
    const zeroed = scores?.filter(
        (score) =>
            score.scoreValue === 0 &&
            score.player.slug === player &&
            score.journey.slug === journey
    );

    return zeroed;
}

function getScoresByJourneyAndPlayer(scores, journey, player) {
    const scoresByJourneyAndPlayer = scores?.filter(
        (score) =>
            score.player.slug === player && score.journey.slug === journey
    );

    return scoresByJourneyAndPlayer;
}
function getScoresByJourney(scores, journey) {
    const scoresByJourney = scores?.filter(
        (score) => score.journey.slug === journey
    );

    return scoresByJourney;
}

function Dashboard() {
    const router = useRouter();
    const {
        data: allScores,
        loading,
        error,
    } = useQuery(QUERY_SCORES, {
        variables: {
            projectSlug: router.query.slug,
        },
    });

    if (!allScores) {
        return null;
    }

    return (
        <>
            <div className="gap-5 max-w-6xl mx-auto md:grid grid-cols-3 ">
                <div className="md:col-span-2 flex flex-col gap-20">
                    <section className="mx-3">
                        <header className="flex justify-between mb-6 items-center px-4 gap-3">
                            <h1 className="text-xl font-bold">
                                <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                Overall progress
                            </h1>
                            <div className="text-lg flex items-center gap-5">
                                <b className="whitespace-nowrap text-sm md:text-xl">
                                    {
                                        getZeroedScores(
                                            allScores?.scores,
                                            "desktop",
                                            "carrefour"
                                        ).length
                                    }{" "}
                                    of{" "}
                                    {
                                        getScoresByJourneyAndPlayer(
                                            allScores?.scores,
                                            "desktop",
                                            "carrefour"
                                        ).length
                                    }
                                </b>

                                <Donnut
                                    total={
                                        getScoresByJourneyAndPlayer(
                                            allScores?.scores,
                                            "desktop",
                                            "carrefour"
                                        ).length
                                    }
                                    sum={
                                        getZeroedScores(
                                            allScores?.scores,
                                            "desktop",
                                            "carrefour"
                                        ).length
                                    }
                                    radius={25}
                                    thick={3}
                                ></Donnut>
                            </div>
                        </header>
                        <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 px-4 pr-8 rounded-lg shadow-lg">
                            <li className="md:w-[700px]">
                                aasasas
                                <Progress
                                    amount={33}
                                    total={54}
                                    legend="Mobile"
                                />
                            </li>
                        </ul>
                    </section>
                </div>
                <div>
                    <h1 className="text-2xl">Categories</h1>
                    {/* <Debugg data={allScores} /> */}
                </div>
            </div>
            <h1>
                Dashboardss{" "}
                {
                    getZeroedScores(allScores?.scores, "desktop", "carrefour")
                        .length
                }{" "}
                /
                {
                    getScoresByJourneyAndPlayer(
                        allScores?.scores,
                        "desktop",
                        "carrefour"
                    ).length
                }
            </h1>

            {/* <Debugg
                data={getZeroedScores(
                    allScores?.scores,
                    "desktop",
                    "carrefour"
                )}
            ></Debugg>
            <Debugg data={allScores}></Debugg> */}
        </>
    );
}

export default Dashboard;
