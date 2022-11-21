import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import client from "../../lib/apollo";

import Debugg from "../../lib/Debugg";
import Donnut from "../Donnut";
import Progress from "../Progress";
import Switch, { SwitchMono } from "../Switch";

const QUERY_SCORES_BY_PROJECT = gql`
    query GetScores(
        $projectSlug: String # $journeySlug: String # $playerSlug: String
        $skipScores: Int
    ) {
        scores(
            where: {
                # player: { slug: $playerSlug }
                project: { slug: $projectSlug }
                # journey: { slug: $journeySlug }
            }
            first: 999999 # skip: $skip
            skip: $skipScores
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

const QUERY_TOTAL_OF_SCORES = gql`
    query getTotalOfScores($projectSlug: String) {
        scoresConnection(where: { project: { slug: $projectSlug } }) {
            aggregate {
                count
            }
        }
    }
`;
const QUERY_PAGINATION = 100;

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
    const blocked = getBlockedPlayers({ scores, journey }).map(
        (player) => player.playerSlug
    );
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

    let success = completed.filter((player) => !blocked.includes(player));

    return success;
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

function getAllJourneys(allScores) {
    const _allJourneys = allScores.map((score) => {
        return score.journey;
    });

    return getUnique(_allJourneys, "slug");
}

/**
 *
 * ------------------------------------
 *
 * COMPONENT
 * -------------------------------------
 */

let _pagination;

function Dashboard({ auth }) {
    const [journey, setJourney] = useState();
    const [totalOfScores, setTotalOfScores] = useState(null);
    const [allScoresDuplicated, setAllScoresDuplicated] = useState([]);
    const [allScores, setAllScores] = useState([]);
    const [loadingDash, setLoadingDash] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setLoadingDash(true);
        const getTotalOfScores = async function getTotalOfScores() {
            const { data: dataTotal } = await client.query({
                query: QUERY_TOTAL_OF_SCORES,
                variables: {
                    projectSlug: router.query.slug,
                },
                fetchPolicy: "network-only",
            });

            setTotalOfScores(dataTotal.scoresConnection.aggregate.count);

            // console.log("dataTotal", dataTotal);
        };

        getTotalOfScores();

        if (totalOfScores) {
            _pagination = Math.ceil(totalOfScores / 100);
        }
        const getNewScores = async function getNewScores(skipScores) {
            const { data: newData } = await client.query({
                query: QUERY_SCORES_BY_PROJECT,
                variables: {
                    projectSlug: router.query.slug,
                    skipScores,
                },
                fetchPolicy: "network-only",
                skip: true,
            });
            setLoadingDash(true);

            setAllScoresDuplicated((prev) => [...prev, ...newData.scores]);

            return newData.scores;
        };

        for (let i = 0; i < _pagination; i++) {
            let itemsToSkip = i * 100;

            doSetTimeout(itemsToSkip);
            // if (i === QUERY_PAGINATION - 2) {
            //     console.log("ter", i);
            //     setLoadingDash(false);
            // }

            // getNewScores(100);
        }

        function doSetTimeout(itemsToSkip) {
            setTimeout(function () {
                console.log("skipp - ", itemsToSkip);
                getNewScores(itemsToSkip);
            }, 500);
        }
    }, [router.query.slug, totalOfScores]);

    // return null

    useEffect(() => {
        console.log("allScoresDuplicated", allScoresDuplicated);
        const allScoresUnique = getUnique(allScoresDuplicated, "id");

        setAllScores(allScoresUnique);
        // setLoadingDash(false);
    }, [allScoresDuplicated]);

    useEffect(() => {
        console.log("comecou");
        const timeout = setTimeout(() => {
            setLoadingDash(false);
        }, _pagination * 200);

        return () => {
            clearTimeout(timeout);
        };
    });

    if (!allScores) {
        return null;
    }

    const allJourneysSlug = getAllJourneys(allScores).map(
        (score) => score.slug
    );

    console.log("allScores", allScores);

    const scoresMobile = getAllScores({
        scores: allScores,
        journey: "mobile",
    });

    const zeroedScores = getZeroedScores({
        scores: allScores,
        journey,
    }).length;

    const scoresAmount = getAllScores({
        scores: allScores,
        journey,
    }).length;

    const doneAmout = scoresAmount - zeroedScores;

    const getPercentageDone = function (player) {
        const total = getPlayerPercentage({
            scores: allScores,
            journey,
            player,
        }).total;

        const sum = getPlayerPercentage({
            scores: allScores,
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

    function getSuccessDone() {
        return getCompletedPlayersSucessfully({
            scores: allScores,
            journey,
        });
    }

    // console.log(getSuccessDone());

    // if (loadingDash || loadingDash === undefined) {
    //     return <div>LOADING....</div>;
    // }

    return (
        <>
            <h1 className={`${loadingDash ? "opacity-100" : "opacity-0"}`}>
                LOADING...
            </h1>
            <div
                style={{ transition: ".5s", transitionDelay: ".5s" }}
                className={`${
                    loadingDash
                        ? "opacity-0 translate-y-6"
                        : "opacity-100 translate-y-0"
                } gap-5 max-w-6xl min-w-full mx-auto md:grid grid-cols-4`}
            >
                <div className="md:col-span-4 flex flex-col gap-20">
                    <section className="mx-3">
                        <header className="flex justify-between mb-6 items-center px-4 gap-3">
                            <h1 className="text-xl font-bold">
                                <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                Analysis progress
                            </h1>
                            <div className="text-lg flex items-center gap-5">
                                <b className="whitespace-nowrap text-sm md:text-xl">
                                    {getAllScores({
                                        scores: allScores,
                                    }).length -
                                        getZeroedScores({
                                            scores: allScores,
                                        }).length}{" "}
                                    of{" "}
                                    {
                                        getAllScores({
                                            scores: allScores,
                                        }).length
                                    }
                                </b>

                                <Donnut
                                    total={
                                        getAllScores({
                                            scores: allScores,
                                        }).length
                                    }
                                    sum={
                                        getAllScores({
                                            scores: allScores,
                                        }).length -
                                        getZeroedScores({
                                            scores: allScores,
                                        }).length
                                    }
                                    radius={25}
                                    thick={3}
                                ></Donnut>
                            </div>
                        </header>

                        <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 px-4 pr-8 rounded-lg shadow-lg">
                            <li className=" mx-auto">
                                <div>
                                    <SwitchMono
                                        options={[
                                            "overall",
                                            ...allJourneysSlug,
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
                                                        scores: allScores,
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
                                                {getSuccessDone().length}
                                            </div>
                                            <div className="text-xs md:text-md">
                                                Successfully Done
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px] text-red-500">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getBlockedPlayers({
                                                        scores: allScores,
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
                                                        scores: allScores,
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
                                                        allScores,
                                                        journey
                                                    ).length
                                                }
                                                sum={
                                                    getBlockedPlayers({
                                                        scores: allScores,
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
                                    <div className="col-span-3">
                                        <h3 className="font-bold text-2xl text-center mt-20">
                                            Progress by Player
                                        </h3>

                                        <ul className="mt-10 mb-10 md:grid md:grid-cols-4 md:max-w-4xl mx-auto gap-5 flex-wrap">
                                            {getAllPlayersObj({
                                                scores: allScores,
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
                                                        className={`col-span-1 flex gap-2 items-center border-r-0 border-r-[${playerColor}] py-3`}
                                                    >
                                                        <div>
                                                            <div
                                                                style={{
                                                                    background:
                                                                        playerColor,
                                                                }}
                                                                className={`p-1 bg-[${playerColor}] w-1 rounded-full hidden`}
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
                                    {/* <div className="col-span-2">
                                        <h3>Player progress</h3>
                                    </div> */}
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
                {/* <div>
                    <h1 className="text-2xl">Categories</h1>
                    
                </div> */}
            </div>

            {/* 
            *
            *
            * 
            * 
            * 
            * 
            
            ------------------------------

            
            Just for debugging 

            ------------------------------
            *
            *
            * 
            * 
            * 
            
            */}

            <pre className="hidden">
                {/* <Debugg data={allScores} /> */}
                <div>Zeroes</div>
                <Debugg
                    data={
                        getZeroedScores({
                            scores: allScores,
                        }).length
                    }
                ></Debugg>

                <div>All Scores length</div>
                <Debugg
                    data={
                        getAllScores({
                            scores: allScores,
                        }).length
                    }
                ></Debugg>
                <div>All Players</div>
                <Debugg data={getAllPlayers(allScores)}></Debugg>
                <div>All Successfully Completed</div>
                <Debugg
                    data={getCompletedPlayersSucessfully({
                        scores: allScores,
                    })}
                ></Debugg>
                <div>All Completed</div>
                <Debugg
                    data={getCompletedPlayers({
                        scores: allScores,
                        journey: "desktop",
                    })}
                ></Debugg>
                <div>All Un-Completed</div>
                <Debugg
                    data={getUncompletedPlayers({
                        scores: allScores,
                    })}
                ></Debugg>
                <div>All Blockers</div>
                <Debugg
                    data={getBlockedPlayers({
                        scores: allScores,
                        journey: "desktop",
                    })}
                ></Debugg>
            </pre>
        </>
    );
}

export default Dashboard;
