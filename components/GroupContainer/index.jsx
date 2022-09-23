import { useEffect, useMemo, useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import HeuristicGroup from "../HeuristicGroup";
import { useScoresContext } from "../../context/scores";
import { getUnicItem, debounce } from "../../lib/utils";
import FindingBlock from "../FindingBlock";
import client from "../../lib/apollo";
import { BtnSmallPrimary } from "../Button";
import Switch from "../Switch";

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
                findingObject: { text: "", theType: "neutral" }
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

const MUTATION_DELETE_FINDING = gql`
    mutation DeleteFinding($findingId: ID) {
        deleteFinding(where: { id: $findingId }) {
            id
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
    // console.log("findingsAAAA", findings);

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

    let addButtonText;
    let addButtonStatus = "active";

    if (findingsLoading) {
        addButtonStatus = "loading";
        addButtonText = "Wait...";
    } else if (findings.length === 0) {
        addButtonText = "Add a new finding";
    } else {
        addButtonText = "Add one more finding";
    }
    return (
        <section className="mx-3">
            <header className="flex flex-col justify-between mb-6 items-center px-4 gap-3">
                <h1 className="text-xl font-bold flex flex-col items-center gap-2">
                    <span className="h-[5px] block bg-primary w-10 mb-1"></span>
                    <span>General Findings</span>
                </h1>
                <div className="text-lg flex items-center gap-5">
                    <p>
                        This is a space for you to put some useful findings
                        regarding this player, that are not described in none of
                        the heuristics above. It could be a good thing (like
                        this player allows credit card scanning) or a bad one
                        (the face recognition does not work properly).
                    </p>
                </div>
            </header>
            <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 px-0 rounded-lg shadow-lg flex flex-col gap-10">
                {findings.length === 0 && (
                    <div className="text-center">
                        <span className="text-3xl">🤷‍♀️</span> <br />
                        No findings registered yet
                    </div>
                )}
                {findings.map((finding, index) => {
                    return (
                        <li key={finding.id}>
                            <FindingBlock
                                finding={finding}
                                callBack={getFindings}
                                index={index}
                                doMutate={doMutate}
                                client={client}
                                mutationEdit={MUTATION_FINDINGS}
                                mutationDelete={MUTATION_DELETE_FINDING}
                            />
                        </li>
                    );
                })}
                <li className="px-8 pb-8 flex justify-center">
                    {/* <button onClick={handleAddOneMoreFinding}>
                        {addButtonText}
                    </button> */}

                    <BtnSmallPrimary
                        status={addButtonStatus}
                        textActive={addButtonText}
                        onClick={handleAddOneMoreFinding}
                    />
                </li>
            </ul>
        </section>
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
            let newId;
            if (verb === "edit") {
                newId = data.updateFinding.id;
                console.log("editando", data);
            } else if (verb === "create") {
                console.log("criando", data);
                newId = data.createFinding.id;
            } else {
                console.log("deletando", data);
                newId = data.deleteFinding.id;
                setFindings();
            }

            doPublic(client, newId, verb, setFindings, setLoading);
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
                setLoading("saved");
            }
        });

    // return _data;
}
