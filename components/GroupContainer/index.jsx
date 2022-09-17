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

const MUTATION_FINDINGS = gql`
    mutation setFindingss($findingId: ID, $text: String, $theType: String) {
        updateFinding(
            where: { id: $findingId }
            data: { findingObject: { text: $text, theType: $theType } }
        ) {
            id
            findingObject
        }
    }
`;

const MUTATION_CREATE_FINDINGS = gql`
    mutation createNewFinding(
        $playerSlug: String
        $journeySlug: String
        $projectSlug: String
    ) {
        createFinding(
            data: {
                project: { connect: { slug: $projectSlug } }
                player: { connect: { slug: $playerSlug } }
                journey: { connect: { slug: $journeySlug } }
                findingObject: { text: "criado aqui", theType: "good criado" }
            }
        ) {
            id
            findingObject
        }
    }
`;

const MUTATION_PUBLISH_FINDING = gql`
    mutation publishFinding($findingId: ID) {
        publishFinding(where: { id: $findingId }) {
            id
            findingObject
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

const debCreateNewScores = debounce((data, router, func) => {
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

    // const {
    //     data: dataFindings,
    //     loading: loadingFindings,
    //     error: errorFindings,
    // } = useQuery(QUERY_FINDINGS, {
    //     variables: {
    //         playerSlug: router.query.player,
    //         projectSlug: router.query.slug,
    //         journeySlug: router.query.journey,
    //     },
    // });
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
                console.log("FINDINGS", data);
                setFindingsList(data);
            });
    }
    useEffect(() => {
        getFindings();
    });

    useEffect(() => {
        if (router.query.journey && dataJourneys) {
            selectedJourney = dataJourneys.journeys?.find(
                (journey) => journey.slug === router.query.journey
            );
        }
    }, [dataJourneys, router]);

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

    if (!dataJourneys) {
        return null;
    }

    // if (!selectedJourney) {
    //     return (
    //         <div className="h-[calc(100vh_-_126px)] flex flex-col items-center px-5 text-center">
    //             <h1 className="text-2xl mb-5">
    //                 {`This player doens't have the selected journey.`}
    //             </h1>
    //             <p>Please, select another journey / player</p>
    //         </div>
    //     );
    // }

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
                <div>
                    <h1 className="text-2xl">Categories</h1>
                    {/* <Debugg data={allScores} /> */}
                </div>
            </div>
        </>
    );
}

function Findings({ data, router, getFindings }) {
    const [findings, setFindings] = useState(data?.findings || []);

    const [findingsLoading, setFindingsLoading] = useState(false);

    useEffect(() => {
        if (data) {
            setFindings(data.findings);
        }
    }, [data]);
    console.log("findings", findings);

    if (!data) {
        return null;
    }

    function handleAddOneMoreFinding() {
        setFindingsLoading(true);
        doMutate(
            client,
            {
                playerSlug: router.query.player,
                journeySlug: router.query.journey,
                projectSlug: router.query.slug,
            },
            MUTATION_CREATE_FINDINGS,
            "create",
            addFinding,
            setFindingsLoading
        );
    }
    function addFinding(finding) {
        // setFindings([...findings, finding]);
        getFindings();
    }
    return (
        <section className="mx-3">
            <header className="flex flex-col justify-between mb-6 items-center px-4 gap-3">
                <h1 className="text-xl font-bold flex flex-col items-center gap-2">
                    <span className="h-[5px] block bg-primary w-10 mb-1"></span>
                    <span>General Findings</span>
                </h1>
                <div className="text-lg flex items-center gap-5">
                    <p>sdsdsdsdsd sd sds ds d</p>
                </div>
            </header>
            <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 px-4 pr-8 rounded-lg shadow-lg">
                {findings.map((finding) => {
                    return (
                        <li key={finding.id}>
                            <FindingBlock finding={finding} />
                        </li>
                    );
                })}
                <li>
                    <button onClick={handleAddOneMoreFinding}>
                        {findingsLoading
                            ? `Loading...`
                            : `Add one more finding`}
                    </button>
                </li>
            </ul>
        </section>
    );
}

function FindingBlock({ finding }) {
    const [text, setText] = useState(finding.findingObject.text || "");

    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);

    function onChangeText(value) {
        setDisabled(false);
        setText(value);
    }

    function handleClickSaveFinding(id) {
        setLoading(true);
        setDisabled(true);
        doMutate(
            client,
            {
                findingId: finding.id,
                text,
                theType: "goodA",
            },
            MUTATION_FINDINGS,
            "edit",
            null,
            setLoading
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <label
                className="text-slate-500"
                htmlFor={"findingText_" + finding.id}
            >
                Type what you`ve found
            </label>
            <textarea
                id={"findingText_" + finding.id}
                className="w-full border border-slate-300 dark:border-slate-500 p-2 h-28 text-slate-500 dark:text-slate-300 rounded-md"
                rows="3"
                value={text}
                onChange={(ev) => {
                    onChangeText(ev.target.value);
                }}
            ></textarea>
            <button
                className={`${disabled && "opacity-50"}`}
                disabled={disabled}
                onClick={handleClickSaveFinding}
            >
                {loading ? "Saving..." : "Save finding"}
            </button>
        </div>
    );
}

function doMutate(
    client,
    variables,
    mutationString,
    verb = "edit",
    setFindings,
    setLoading
) {
    // console.log(client, variables, mutationString, isCreate, setFindings);
    console.log("verb", verb);
    client
        .mutate({
            mutation: mutationString,
            variables,
        })
        .then(({ data }) => {
            doPublic(
                client,
                data.updateFinding.id,
                verb,
                setFindings,
                setLoading
            );
        });
}

function doPublic(client, newId, verb, setFindings, setLoading) {
    console.log("varr", newId);

    client
        .mutate({
            mutation: MUTATION_PUBLISH_FINDING,
            variables: { findingId: newId },
        })
        .then(({ data }) => {
            console.log("verb", verb);
            if (verb === "create") {
                console.log("publicou", data.publishFinding);
                setFindings(data.publishFinding);
                setLoading(false);
            } else if (verb === "edit") {
                console.log("publicou EDIT", data.publishFinding);
                setLoading(false);
            }
        });

    // return _data;
}
