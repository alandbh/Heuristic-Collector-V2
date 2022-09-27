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
function getAllPlayersObj(params) {
    const { scores, journey, player } = params;
    const scoresByJourney = getAllScores({
        scores,
        journey,
    });
    const playersArr = scoresByJourney.map((score) => score.player);

    return getUnique(playersArr, "slug");
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

    return {
        total: scoresByPlayer.length,
        sum: scoresByPlayer.length - zeroedPlayersScored.length,
        percentage: percentage,
    };
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

function hasBlocker(playerObj) {
    return playerObj.finding.some(
        (obj) => obj.findingObject.theType === "blocker"
    );
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
        let uniqueKey = [];
        let uniqueObj = [];
        arr.forEach((obj) => {
            if (!uniqueKey.includes(obj[key])) {
                uniqueKey.push(obj[key]);
                uniqueObj.push(obj);
            }
        });

        return uniqueObj;
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

    const zeroedScores = getZeroedScores({
        scores: allScores.scores,
        journey,
    }).length;

    const scoresAmount = getAllScores({
        scores: allScores.scores,
        journey,
    }).length;

    const doneAmout = scoresAmount - zeroedScores;

    const getPercentageDone = function (player) {
        const total = getPlayerPercentage({
            scores: allScores.scores,
            journey,
            player,
        }).total;

        const sum = getPlayerPercentage({
            scores: allScores.scores,
            journey,
            player,
        }).sum;

        return {
            total,
            sum,
        };
    };

    function onChangeJourney(journey) {
        let selectedJourney = journey !== "overall" ? journey : "";
        setJourney(selectedJourney);
    }

    console.log(getAllPlayersObj({ scores: allScores.scores }));

    return (
        <>
            <div className="gap-5 max-w-6xl mx-auto md:grid grid-cols-4 ">
                <div className="md:col-span-3 flex flex-col gap-20">
                    <section className="mx-3">
                        <header className="flex justify-between mb-6 items-center px-4 gap-3">
                            <h1 className="text-xl font-bold">
                                <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                Analysis progress
                            </h1>
                            <div className="text-lg flex items-center gap-5">
                                <b className="whitespace-nowrap text-sm md:text-xl">
                                    {getAllScores({
                                        scores: allScores?.scores,
                                    }).length -
                                        getZeroedScores({
                                            scores: allScores?.scores,
                                        }).length}{" "}
                                    of{" "}
                                    {
                                        getAllScores({
                                            scores: allScores?.scores,
                                        }).length
                                    }
                                </b>

                                <Donnut
                                    total={
                                        getAllScores({
                                            scores: allScores?.scores,
                                        }).length
                                    }
                                    sum={
                                        getAllScores({
                                            scores: allScores?.scores,
                                        }).length -
                                        getZeroedScores({
                                            scores: allScores?.scores,
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
                                    <div className="flex flex-wrap gap-4 justify-between md:gap-10 text-center w-auto">
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px]">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getCompletedPlayers({
                                                        scores: allScores?.scores,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div className="text-xs md:text-md">
                                                Done
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px] text-green-600">
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
                                            <div className="text-xs md:text-md">
                                                Successfully Done
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px] text-red-500">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getBlockedPlayers({
                                                        scores: allScores.scores,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div className="text-xs md:text-md">
                                                With Blockers
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px] text-blue-600">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getUncompletedPlayers({
                                                        scores: allScores?.scores,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div className="text-xs md:text-md">
                                                In Progress
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-10">
                                        <div className="flex flex-col gap-5 text-center items-center">
                                            <Donnut
                                                total={scoresAmount}
                                                sum={doneAmout}
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

                                {/* 
                                
                                    Progress By Player 
                                    ----------------------------

                                 */}

                                <div className="grid grid-cols-3 mt-10">
                                    <div className="col-span-1">
                                        <h3>Players</h3>

                                        <ul className="mt-10">
                                            {getAllPlayersObj({
                                                scores: allScores.scores,
                                                journey,
                                            }).map((player) => {
                                                let playerColor;

                                                if (hasBlocker(player)) {
                                                    playerColor = "#ff0000";
                                                } else if (
                                                    getPercentageDone(
                                                        player.slug
                                                    ).sum ===
                                                    getPercentageDone(
                                                        player.slug
                                                    ).total
                                                ) {
                                                    playerColor = "#1cab1c";
                                                } else {
                                                    playerColor = "dodgerblue";
                                                }

                                                return (
                                                    <li
                                                        key={player.slug}
                                                        className={`flex gap-2 items-center border-r-2 border-r-[${playerColor}] py-3`}
                                                    >
                                                        <div>
                                                            <div
                                                                style={{
                                                                    background:
                                                                        playerColor,
                                                                }}
                                                                className={`p-1 bg-[${playerColor}] w-1 rounded-full`}
                                                            ></div>
                                                        </div>
                                                        <div className="flex-1 mr-2">
                                                            <Progress
                                                                amount={
                                                                    getPercentageDone(
                                                                        player.slug
                                                                    ).sum
                                                                }
                                                                total={
                                                                    getPercentageDone(
                                                                        player.slug
                                                                    ).total
                                                                }
                                                                legend={
                                                                    player.name
                                                                }
                                                                size="small"
                                                                barColor={
                                                                    playerColor
                                                                }
                                                            />
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    <div className="col-span-2">
                                        <h3>Player progress</h3>
                                    </div>
                                </div>
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
                    journey: "desktop",
                })}
            ></Debugg>
        </>
    );
}

export default Dashboard;
