import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import client from "../../lib/apollo";

import Debugg from "../../lib/Debugg";
import Donnut from "../Donnut";
import Progress from "../Progress";
import Switch, { SwitchMono } from "../Switch";

const QUERY_SCORES_BY_PROJECT = gql`
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
                finding {
                    findingObject
                }
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

function getZeroedScores(params) {
    const { scores, journey, player } = params;
    let zeroed;
    if (scores && journey && player) {
        zeroed = scores?.filter(
            (score) =>
                score.scoreValue === 0 &&
                score.player.slug === player &&
                score.journey.slug === journey
        );
    } else if (scores && journey) {
        zeroed = scores?.filter(
            (score) => score.scoreValue === 0 && score.journey.slug === journey
        );
    } else if (scores && player) {
        zeroed = scores?.filter(
            (score) => score.scoreValue === 0 && score.player.slug === player
        );
    } else {
        zeroed = scores?.filter((score) => score.scoreValue === 0);
    }

    return zeroed;
}

function getAllScores(params) {
    const { scores, journey, player } = params;
    const scoresByJourneyAndPlayer = scores?.filter(
        (score) =>
            score.player.slug === player && score.journey.slug === journey
    );

    let allScores;
    if (scores && journey && player) {
        allScores = scores?.filter(
            (score) =>
                score.player.slug === player && score.journey.slug === journey
        );
    } else if (scores && journey) {
        allScores = scores?.filter((score) => score.journey.slug === journey);
    } else if (scores && player) {
        allScores = scores?.filter((score) => score.player.slug === player);
    } else {
        allScores = scores;
    }

    return allScores;
}

function getAllPlayers(scores, journey) {
    const scoresByJourney = getAllScores({
        scores,
        journey,
    });
    const playersArr = scoresByJourney.map((score) => score.player.slug);

    return getUnique(playersArr);
}

function getCompletedPlayersSucessfully(params) {
    const { scores, journey, player } = params;
    const zeroed = getZeroedScores({ scores, journey });
    const allPlayers = getAllPlayers(scores, journey);
    const blocked = getBlockedPlayers({ scores, journey });
    let completed = [];

    allPlayers.map((player) => {
        const zeroedScore = zeroed.filter(
            (score) => score.player.slug === player
        );
        if (zeroedScore.length === 0) {
            completed.push(player);
            return player;
        }
        return;
    });

    return completed.filter((player) => !blocked.includes(player));
}
function getCompletedPlayers(params) {
    const { scores, journey, player } = params;
    const zeroed = getZeroedScores({ scores, journey });
    const allPlayers = getAllPlayers(scores, journey);
    let completed = [];

    allPlayers.map((player) => {
        const zeroedScore = zeroed.filter(
            (score) => score.player.slug === player
        );
        if (zeroedScore.length === 0) {
            completed.push(player);
            return player;
        }
        return;
    });

    return completed;
}

function getPlayerPercentage(params) {
    const { scores, journey, player } = params;

    const scoresByPlayer = getAllScores({
        scores,
        player,
        journey,
    });

    const zeroedPlayersScored = getZeroedScores({
        scores,
        player,
        journey,
    });

    let percentage;

    percentage =
        ((scoresByPlayer.length - zeroedPlayersScored.length) /
            scoresByPlayer.length) *
        100;

    return percentage;
}

/**
 * @typedef {Object} ParamObj
 * @property {array} scores - scores array
 * @property {string} journey - Indicates whether user has close the toast.
 */
/**
 * Function to get uncompleted Players
 * @param {ParamObj}} - {@link params} object
 * @returns [playerSlug]
 */
function getUncompletedPlayers(params) {
    const { scores, journey } = params;
    const zeroed = getZeroedScores({ scores, journey });
    let uncompleted = zeroed.map((score) => score.player.slug);

    return getUnique(uncompleted);
}

function getBlockedPlayers(params) {
    const { scores, journey } = params;

    let selectedScores;
    let blocked = [];

    if (journey) {
        selectedScores = getAllScores({ scores, journey });
    } else {
        selectedScores = scores;
    }

    selectedScores.map((score) => {
        const finding = score.player.finding.find(
            (found) => found.findingObject.theType === "blocker"
        );
        if (finding !== undefined) {
            blocked.push({
                playerSlug: score.player.slug,
                theType: finding.findingObject.theType,
            });
        }
    });

    return getUnique(blocked, "playerSlug");
}

function getUnique(arr, key = null, subkey = null) {
    if (key && subkey) {
        let unique = [];
        arr.forEach((obj) => {
            if (!unique.includes(obj[key][subkey])) {
                unique.push(obj[key][subkey]);
            }
        });
    } else if (key && !subkey) {
        let unique = [];
        arr.forEach((obj) => {
            if (!unique.includes(obj[key])) {
                unique.push(obj[key]);
            }
        });

        return unique;
    }

    return [...new Set(arr)];
}

/**
 *
 * ------------------------------------
 *
 * COMPONENT
 * -------------------------------------
 */
function Dashboard() {
    const [journey, setJourney] = useState();
    const router = useRouter();
    const {
        data: allScores,
        loading,
        error,
    } = useQuery(QUERY_SCORES_BY_PROJECT, {
        variables: {
            projectSlug: router.query.slug,
        },
    });

    if (!allScores) {
        return null;
    }

    const scoresMobile = getAllScores({
        scores: allScores.scores,
        journey: "mobile",
    });

    // const scoresByPlayer = getAllScores({
    //     scores: allScores.scores,
    //     player: "carrefour",
    //     journey: "desktop",
    // });

    // const zeroedPlayersScored = getZeroedScores({
    //     scores: allScores.scores,
    //     player: "carrefour",
    //     journey: "desktop",
    // });

    // const percentage =
    //     ((scoresByPlayer.length - zeroedPlayersScored.length) /
    //         scoresByPlayer.length) *
    //     100;

    const percentageDone = function () {
        const zeroedScores = getZeroedScores({
            scores: allScores.scores,
            journey,
        }).length;

        const scoresAmount = getAllScores({
            scores: allScores.scores,
            journey,
        }).length;

        const doneAmout = scoresAmount - zeroedScores;

        return {
            total: scoresAmount,
            sum: doneAmout,
        };
    };

    console.log(percentageDone());

    function onChangeJourney(journey) {
        let selectedJourney = journey !== "overall" ? journey : "";
        setJourney(selectedJourney);
    }

    return (
        <>
            <div className="gap-5 max-w-6xl mx-auto md:grid grid-cols-3 ">
                <div className="md:col-span-2 flex flex-col gap-20">
                    <section className="mx-3">
                        <header className="flex justify-between mb-6 items-center px-4 gap-3">
                            <h1 className="text-xl font-bold">
                                <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                Analysis progress
                            </h1>
                            <div className="text-lg flex items-center gap-5">
                                <b className="whitespace-nowrap text-sm md:text-xl">
                                    {
                                        getZeroedScores({
                                            scores: allScores?.scores,
                                            journey: "desktop",
                                            player: "carrefour",
                                        }).length
                                    }{" "}
                                    of{" "}
                                    {
                                        getAllScores({
                                            scores: allScores?.scores,
                                            journey: "desktop",
                                            player: "carrefour",
                                        }).length
                                    }
                                </b>

                                <Donnut
                                    total={
                                        getAllScores({
                                            scores: allScores?.scores,
                                            journey: "desktop",
                                            player: "carrefour",
                                        }).length
                                    }
                                    sum={
                                        getZeroedScores({
                                            scores: allScores?.scores,
                                            journey: "desktop",
                                            player: "carrefour",
                                        }).length
                                    }
                                    radius={25}
                                    thick={3}
                                ></Donnut>
                            </div>
                        </header>

                        <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 px-4 pr-8 rounded-lg shadow-lg">
                            <li className="md:w-[700px]">
                                <div>
                                    <SwitchMono
                                        options={[
                                            "overall",
                                            "desktop",
                                            "mobile",
                                        ]}
                                        onChange={(journey) =>
                                            onChangeJourney(journey)
                                        }
                                        selected={"overall"}
                                    />
                                </div>

                                {/* 
                                    Big Numbers
                                    ------------------
                                */}

                                <div className="flex gap-10 flex-col items-center justify-center mt-20">
                                    <div className="flex flex-wrap gap-10 text-center w-auto">
                                        <div className="flex flex-col gap-3">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getCompletedPlayers({
                                                        scores: allScores?.scores,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div>Done</div>
                                        </div>
                                        <div className="flex flex-col gap-3 text-green-600">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getCompletedPlayersSucessfully(
                                                        {
                                                            scores: allScores?.scores,
                                                            journey,
                                                        }
                                                    ).length
                                                }
                                            </div>
                                            <div>Successfully Done</div>
                                        </div>
                                        <div className="flex flex-col gap-3 text-red-500">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getBlockedPlayers({
                                                        scores: allScores.scores,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div>With Blockers</div>
                                        </div>
                                        <div className="flex flex-col gap-3 text-blue-600">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getUncompletedPlayers({
                                                        scores: allScores?.scores,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div>In Progress</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-10">
                                        <div className="flex flex-col gap-5 text-center items-center">
                                            <Donnut
                                                total={percentageDone().total}
                                                sum={percentageDone().sum}
                                                radius={58}
                                                thick={6}
                                            ></Donnut>

                                            <h3 className="font-bold text-xl">
                                                Done
                                            </h3>
                                        </div>

                                        <div className="flex flex-col gap-5 text-center items-center">
                                            <Donnut
                                                total={
                                                    getAllPlayers(
                                                        allScores.scores,
                                                        journey
                                                    ).length
                                                }
                                                sum={
                                                    getBlockedPlayers({
                                                        scores: allScores.scores,
                                                        journey,
                                                    }).length
                                                }
                                                radius={58}
                                                thick={6}
                                                color={{
                                                    base: "#ddd",
                                                    primary: "red",
                                                }}
                                            ></Donnut>
                                            <h3 className="font-bold text-xl">
                                                Players with flags
                                            </h3>
                                        </div>
                                    </div>
                                </div>
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

            <div>Zeroes</div>
            <Debugg
                data={
                    getZeroedScores({
                        scores: allScores?.scores,
                    }).length
                }
            ></Debugg>

            <div>All Scores length</div>
            <Debugg
                data={
                    getAllScores({
                        scores: allScores?.scores,
                    }).length
                }
            ></Debugg>
            <div>All Players</div>
            <Debugg data={getAllPlayers(allScores.scores)}></Debugg>
            <div>All Successfully Completed</div>
            <Debugg
                data={getCompletedPlayersSucessfully({
                    scores: allScores?.scores,
                })}
            ></Debugg>
            <div>All Completed</div>
            <Debugg
                data={getCompletedPlayers({
                    scores: allScores?.scores,
                    journey: "desktop",
                })}
            ></Debugg>
            <div>All Un-Completed</div>
            <Debugg
                data={getUncompletedPlayers({
                    scores: allScores?.scores,
                })}
            ></Debugg>
            <div>All Blockers</div>
            <Debugg
                data={getBlockedPlayers({
                    scores: allScores.scores,
                    journey: "mobile",
                })}
            ></Debugg>
        </>
    );
}

export default Dashboard;
