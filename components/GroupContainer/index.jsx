import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { Link as Scroll } from "react-scroll";
import HeuristicGroup from "../HeuristicGroup";
import { useScoresContext } from "../../context/scores";
import { getUnicItem, debounce, useScroll } from "../../lib/utils";
import Findings from "../Findings";
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

const QUERY_FINDINGS = gql`
    query GetAllFindings(
        $projectSlug: String
        $playerSlug: String
        $journeySlug: String
    ) {
        findings(
            where: {
                player: { slug: $playerSlug }
                journey: { slug: $journeySlug }
                project: { slug: $projectSlug }
            }
        ) {
            id
            findingObject
        }
    }
`;

// let selectedJourney;

const uniqueHeuristics = [];
let groupsMapped = null;

const getUniqueGroups = debounce((arr, key, func) => {
    groupsMapped = getUnicItem(arr, key);

    console.log("unique", groupsMapped);

    func(groupsMapped);

    // func();
}, 300);

const debCreateNewScores = debounce((data, router, func) => {
    console.log("groupssss", data.groups);

    if (data.groups.length === 0) {
        return null;
    }

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
            publishNewScores(func);
        });
}, 500);

function publishNewScores(func) {
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
            func();
        });
}

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
    const [findingsList, setFindingsList] = useState(null);
    const [findingsLoading, setFindingsLoading] = useState(true);
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

    function getFindings() {
        client
            .query({
                query: QUERY_FINDINGS,
                variables: {
                    playerSlug: router.query.player,
                    projectSlug: router.query.slug,
                    journeySlug: router.query.journey,
                },
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                setFindingsList(data);
            });
    }
    useEffect(() => {
        getFindings();
    });

    // useEffect(() => {
    //     if (router.query.journey && dataJourneys) {
    //         selectedJourney = dataJourneys.journeys?.find(
    //             (journey) => journey.slug === router.query.journey
    //         );
    //     }
    // }, [dataJourneys, router]);

    /**
     *
     * Setting empty scores
     * ------------------------------
     */

    useEffect(() => {
        // setEmpty(true);
        getNewScores().then((dataScores) => {
            // console.log("newscores", dataScores);

            if (dataScores.length > 0) {
                // console.log("newscoreswwww", dataScores);
                setEmpty(false);
            } else {
                createNewScores();
                // debCreateNewScores(data, router);
            }
        });
    });

    function createNewScores() {
        debCreateNewScores(data, router, () => {
            setEmpty(false);
        });
    }

    const [scrollY, setScrollY] = useScroll(0);

    if (!dataJourneys) {
        return null;
    }

    return (
        <>
            <div className="gap-5 max-w-5xl mx-auto md:grid grid-cols-3 ">
                <div className="md:col-span-2 flex flex-col gap-20">
                    {data.groups.map((group) => (
                        <HeuristicGroup group={group} key={group.id} />
                    ))}

                    <Findings
                        data={findingsList}
                        router={router}
                        getFindings={getFindings}
                    />
                </div>
                <div className="relative">
                    <div className={scrollY > 150 ? "fixed top-8" : "relative"}>
                        <aside className="mb-10">
                            <h1 className="text-slate-400 text-sm uppercase mb-5 border-b-2 pb-3">
                                Search
                            </h1>
                            <input type="search" name="search" id="search" />
                        </aside>
                        <aside>
                            <h1 className="text-slate-400 text-sm uppercase mb-5 border-b-2 pb-3">
                                Heuristic Groups
                            </h1>
                            <ul>
                                {data.groups.map((group) => (
                                    <li
                                        key={group.id}
                                        className="cursor-pointer"
                                    >
                                        {/* <a href={"#" + group.id}>{group.name}</a> */}
                                        <Scroll
                                            activeClass="underline underline-offset-4 hover:text-blue-700"
                                            className="py-1 block text-primary font-bold hover:text-slate-800"
                                            to={group.id}
                                            spy={true}
                                            smooth={true}
                                            offset={-50}
                                        >
                                            {group.name}
                                        </Scroll>
                                    </li>
                                ))}

                                <li className="mt-5">
                                    <hr />
                                </li>

                                <li className="cursor-pointer mt-5">
                                    <Scroll
                                        activeClass="underline underline-offset-4 hover:text-blue-700"
                                        className="py-1 block text-primary font-bold hover:text-slate-800"
                                        to="findings_section"
                                        spy={true}
                                        smooth={true}
                                        offset={-50}
                                    >
                                        General Findings
                                    </Scroll>
                                </li>
                            </ul>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
