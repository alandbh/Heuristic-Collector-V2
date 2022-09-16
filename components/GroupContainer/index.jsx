import { useEffect, useMemo, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import HeuristicGroup from "../HeuristicGroup";
import { useScoresContext } from "../../context/scores";
import { getUnicItem, debounce } from "../../lib/utils";
import client from "../../lib/apollo";

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

const uniqueHeuristics = [];
let groupsMapped = null;

const getUniqueGroups = debounce((arr, key, func) => {
    groupsMapped = getUnicItem(arr, key);

    console.log("unique", groupsMapped);

    func(groupsMapped);

    // func();
}, 300);

const debCreateNewScores = debounce((data, router) => {
    console.log("groupssss", data.groups);

    data.groups.forEach((group) => {
        group.heuristic.forEach((heurisric) => {
            return (multiString =
                multiString +
                stringCreateFunc(
                    heurisric.id,
                    router.query.slug,
                    router.query.player,
                    router.query.journey
                ));
        });
    });

    stringCreate = `
    mutation createMultipleScores {
       ${multiString}
    }
    `;

    MUTATION_CREATE_MANY_SCORE = gql(stringCreate);

    client
        .mutate({
            mutation: MUTATION_CREATE_MANY_SCORE,
        })
        .then((data) => {
            publishNewScores();
        });
}, 500);

function publishNewScores() {
    const PUBLISH_STRING = gql`
        mutation publishManyScores {
            publishManyScoresConnection(first: 1000, where: { scoreValue: 0 }) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `;

    client
        .mutate({
            mutation: PUBLISH_STRING,
        })
        .then((data) => {
            console.log("PUBLICOU", data);
        });
}

// function getUnicScores(arr) {
//     let unique = null;
//     unique = arr.filter((element) => {
//         const isDuplicate = uniqueHeuristics.includes(element.heuristicId);

//         if (!isDuplicate) {
//             uniqueHeuristics.push(element.heuristicId);

//             return true;
//         }

//         return false;
//     });

//     return unique;
// }

let multiString = "";

let stringCreate = "";

let MUTATION_CREATE_MANY_SCORE;

const stringCreateFunc = (
    heuristicId,
    projectSlug,
    playerSlug,
    journeySlug
) => `createScore(
    data: {
        scoreValue: 0
        project: { connect: { slug: "${projectSlug}" } }
        player: { connect: { slug: "${playerSlug}" } }
        journey: { connect: { slug: "${journeySlug}" } }
        evidenceUrl: ""
        note: ""
        heuristic: { connect: { id: "${heuristicId}" } }
    }
) {
    scoreValue
    id
},

`;

/**
 *
 *
 *
 * ---------------------------------
 * GroupContainer COMPONENT
 * ---------------------------------
 *
 *
 */

export default function GroupContainer({ data }) {
    const router = useRouter();
    const [empty, setEmpty] = useState(true);
    const [groups, setGroups] = useState(null);
    const [newScores, setNewScores] = useState([]);
    const { allScores, getNewScores } = useScoresContext();
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

    /**
     *
     * Setting empty scores
     * ------------------------------
     */

    // const groupsMemo = useMemo(() => {
    //     getUniqueGroups(data.groups, "id");
    //     return data.groups;
    // }, [data]);

    /**
     *
     * Mapping groups
     */

    // groupsMemo.map((group) => {
    //     groupsMapped.push(group);
    //     group.heuristic.map((heuristicItem) => {});
    // });

    // if (groupsMapped) {
    //     groupsMapped.map((group) => {
    //         console.log("heuristics", group.heuristic);
    //     });
    // }

    // useEffect(() => {
    //     setGroups(data.groups);
    // }, [data]);

    useEffect(() => {
        // setEmpty(true);
        getNewScores().then((data) => {
            console.log("newscores", data);

            if (data.length > 0) {
                console.log("newscoreswwww", data);
                setEmpty(false);
            } else {
                createNewScores();
            }
        });
    }, [getNewScores]);

    function createNewScores() {
        debCreateNewScores(data, router);
    }

    // useEffect(() => {
    // }, [groups, stringCreateFunc, empty]);

    if (!dataJourneys) {
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

    // if (empty) {
    //     return null;
    // }

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
