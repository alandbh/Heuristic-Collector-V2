import { useEffect, useMemo, useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import HeuristicGroup from "../HeuristicGroup";
import { useScoresContext } from "../../context/scores";
import { getUnicItem, debounce } from "../../lib/utils";
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

const MURATION_DELETE_FINDING = gql`
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
            <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 px-0 rounded-lg shadow-lg flex flex-col gap-10">
                {findings.length === 0 && <div>No findings registered yet</div>}
                {findings.map((finding, index) => {
                    return (
                        <li key={finding.id}>
                            <FindingBlock
                                finding={finding}
                                callBack={getFindings}
                                index={index}
                            />
                        </li>
                    );
                })}
                <li className="px-8">
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

function FindingBlock({ finding, callBack, index }) {
    const [text, setText] = useState(finding.findingObject.text || "");

    const [theType, setTheType] = useState(
        finding.findingObject.theType || "neutral"
    );
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("disabled");
    const [disabled, setDisabled] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const groupRef = useRef(null);

    function onChangeText(value) {
        setDisabled(false);
        setStatus("active");
        setText(value);
    }

    function onChangeTheType(type) {
        setTheType(type);
        setDisabled(false);
        setStatus("active");
    }

    function handleClickSaveFinding(id) {
        setLoading(true);
        setStatus("loading");
        setDisabled(true);
        doMutate(
            client,
            {
                findingId: finding.id,
                text,
                theType: theType,
            },
            MUTATION_FINDINGS,
            "edit",
            null,
            setStatus
        );
    }

    function handleClickDelete() {
        setConfirmOpen(true);
    }

    function doDeleteFinding() {
        groupRef.current.style.transition = "0.5s";
        groupRef.current.style.opacity = "0";
        groupRef.current.style.transform = "translateX(-80px)";

        setTimeout(() => {
            setConfirmOpen(false);
            doMutate(
                client,
                {
                    findingId: finding.id,
                },
                MURATION_DELETE_FINDING,
                "delete",
                reloadFindingList,
                setLoading
            );
        }, 500);
    }

    function reloadFindingList(finding) {
        // setFindings([...findings, finding]);
        callBack();
    }

    return (
        <div className="flex flex-col gap-3 overflow-x-hidden">
            <div ref={groupRef} className="px-8">
                <h3 className="font-bold text-lg">Finding #{index + 1}</h3>
                <label
                    className="text-slate-500"
                    htmlFor={"findingText_" + finding.id}
                >
                    Type what you`ve found
                </label>
                <div className="flex gap-4 flex-col">
                    <textarea
                        id={"findingText_" + finding.id}
                        className="w-full border border-slate-300 dark:border-slate-500 p-2 h-28 text-slate-500 dark:text-slate-300 rounded-md"
                        rows="3"
                        value={text}
                        onChange={(ev) => {
                            onChangeText(ev.target.value);
                        }}
                    ></textarea>
                    <div className="flex justify-end">
                        {confirmOpen ? (
                            <div className="flex gap-2 items-center">
                                <span className="opacity-60">
                                    Confirm delete?{" "}
                                </span>
                                <button
                                    className="border px-4 rounded-full h-7 text-red-500 border-red-500 hover:bg-red-700/10"
                                    onClick={doDeleteFinding}
                                >
                                    Yes
                                </button>
                            </div>
                        ) : (
                            <button
                                className="text-red-500 "
                                onClick={handleClickDelete}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-500">
                                Choose an option for this finding:
                            </label>
                            <Switch
                                options={["bad", "neutral", "good"]}
                                onChange={(theType) => onChangeTheType(theType)}
                                selected={theType}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center md:justify-end mb-5 mt-5">
                        <BtnSmallPrimary
                            disabled={disabled}
                            status={status}
                            textActive="Save Finding"
                            textFinished="Saved"
                            onClick={handleClickSaveFinding}
                        />
                    </div>
                </div>
            </div>
            <div className="dark:opacity-10">
                <hr />
            </div>
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
