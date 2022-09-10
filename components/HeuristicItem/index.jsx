import { gql, useMutation } from "@apollo/client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useScoresContext } from "../../context/scores";
import { useRouter } from "next/router";
import Range from "../Range";
import client from "../../lib/apollo";
import { debounce, throttle } from "../../lib/utils";

const initialScore = {};

class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}

const deferredPromise = {
    run: null,
};

async function waitForNewData() {
    deferredPromise.run = new Deferred();

    function standByDataT() {
        return deferredPromise.run.promise;
    }

    let dataNew = await standByDataT();

    return dataNew;
}

function standByData() {
    return new Promise((resolve, reject) => {
        const intervalGetItd = setInterval(() => {
            if (initialScore.id) {
                resolve(initialScore);

                stopListening();
            }
        }, 1000);

        function stopListening() {
            clearInterval(intervalGetItd);
            initialScore.isNew = false;
        }
    });
}

/**
 *
 * GRAPHQL CONSTANTS
 */
const MUTATION_SCORE = gql`
    mutation setScores($scoreId: ID, $scoreValue: Int, $scoreNote: String) {
        updateScore(
            where: { id: $scoreId }
            data: { scoreValue: $scoreValue, note: $scoreNote }
        ) {
            id
            note
            scoreValue
            evidenceUrl
        }
    }
`;
const MUTATION_SCORE_EVIDENCE = gql`
    mutation setScores($scoreId: ID, $evidenceUrl: String) {
        updateScore(
            where: { id: $scoreId }
            data: { evidenceUrl: $evidenceUrl }
        ) {
            id
            scoreValue
            evidenceUrl
        }
    }
`;

const MUTATION_PUBLIC = gql`
    mutation setScorePublic($scoreId: ID) {
        publishScore(where: { id: $scoreId }, to: PUBLISHED) {
            id
            scoreValue
            note
            evidenceUrl
            heuristic {
                heuristicNumber
            }
        }
    }
`;

const MUTATION_CREATE_SCORE = gql`
    mutation createNewScore(
        $projectSlug: String
        $playerSlug: String
        $journeySlug: String
        $scoreValue: Int!
        $heuristicId: ID
    ) {
        createScore(
            data: {
                scoreValue: $scoreValue
                project: { connect: { slug: $projectSlug } }
                player: { connect: { slug: $playerSlug } }
                journey: { connect: { slug: $journeySlug } }
                evidenceUrl: ""
                heuristic: { connect: { id: $heuristicId } }
            }
        ) {
            scoreValue
            id
        }
    }
`;

/**
 *
 * Debounced function for processing changes on Range
 */
const processChange = debounce(
    async (variables, gqlString, isCreate = false) => {
        console.log("Saving data func");

        doMutate(variables, gqlString, isCreate);
    },
    1000,
    false
);

const processChangeText = debounce(
    async (variables, gqlString, isCreate = false) => {
        console.log("Saving TEXT func");

        doMutate(variables, gqlString, isCreate);
    },
    1000,
    false
);
const processChangeUrl = debounce(
    async (variables, gqlString, isCreate = false) => {
        console.log("Saving URL func");

        doMutate(variables, gqlString, isCreate);
    },
    300,
    false
);

async function doMutate(variables, gqlString, isCreate) {
    const { data } = await client.mutate({
        mutation: gqlString,
        variables,
    });

    if (data) {
        console.log("doMutate", data);
        const newId = isCreate ? data.createScore.id : data.updateScore.id;
        doPublic(newId);
    }
}

async function doPublic(newId) {
    // console.log("varr", newId);

    const { data } = await client.mutate({
        mutation: MUTATION_PUBLIC,
        variables: { scoreId: newId },
    });

    console.log("resopp", data);

    initialScore.id = await data.publishScore.id;
    initialScore.scoreValue = await data.publishScore.scoreValue;
    initialScore.note = await data.publishScore.note;
    initialScore.heuristic = await data.publishScore.heuristic;
    initialScore.now = Date.now();

    deferredPromise.run.resolve(data.publishScore);

    // return _data;
}

/**
 *
 *
 * Begining of the component
 * ----------------------------------
 *
 * @param {*props} param0
 * @returns Heuristic Item with Range and Note
 */

function HeuristicItem({ heuristic, id }) {
    const [score, setScore] = useState(0);
    const [empty, setEmpty] = useState(false);
    const [text, setText] = useState(currentScore?.note || "");
    const [evidenceUrl, setEvidenceUrl] = useState(
        currentScore?.evidenceUrl || ""
    );
    const { allScores, setAllScores } = useScoresContext();
    const [boxOpen, setBoxOpen] = useState(false);
    const router = useRouter();

    // debugger;
    // console.log("scores", allScores);

    const currentScore = allScores.find(
        (someScore) =>
            someScore.heuristic.heuristicNumber === heuristic.heuristicNumber
    );
    // const currentScore = useMemo(() => {
    //     allScores.find(
    //         (score) =>
    //             score.heuristic.heuristicNumber === heuristic.heuristicNumber
    //     );
    // }, [allScores, heuristic]);

    useEffect(() => {
        // debugger;
        // console.log("HAS SCORE", currentScore);
        if (currentScore !== undefined) {
            setScore(currentScore.scoreValue);
            setText(currentScore.note);
            setEvidenceUrl(currentScore.evidenceUrl);
            if (currentScore.note || currentScore.scoreValue) {
                setEnable(true);
            }
            setEmpty(false);
        } else {
            setEmpty(true);
            setScore(0);
            // console.log("Undefined????");
        }
    }, [currentScore]);

    /**
     *
     * Setting the Score
     *
     * @param {*event} ev
     */

    const [enable, setEnable] = useState(false);
    const [toast, setToast] = useState({ open: false, text: "" });

    async function handleChangeRange(ev) {
        setScore(Number(ev.target.value));
        // let newScores = [...allScores];
        // debugger;
        let newScores = allScores.map((score) =>
            score.heuristic.heuristicNumber === heuristic.heuristicNumber
                ? { ...score, scoreValue: Number(ev.target.value) }
                : score
        );

        setAllScores(newScores);
        // console.log("newScores", allScores);
        // let dataNewAntes = await waitForNewData();

        // console.log("NEW PROMISE ANTES", dataNewAntes);

        saveValue();

        function saveValue() {
            if (empty) {
                // debugger;
                processChange(
                    {
                        projectSlug: router.query.slug,
                        playerSlug: router.query.player,
                        journeySlug: router.query.journey,
                        heuristicId: heuristic.id,
                        scoreValue: Number(ev.target.value),
                    },
                    MUTATION_CREATE_SCORE,
                    true
                );
            } else {
                processChange(
                    {
                        scoreId: currentScore.id,
                        scoreValue: Number(ev.target.value),
                        scoreNote: currentScore.note,
                    },
                    MUTATION_SCORE
                );
            }
        }

        let dataNew = await waitForNewData();

        console.log("NEW PROMISE", dataNew);
        setEnable(true);

        setToast({
            open: true,
            text: `Heuristic ${dataNew.heuristic.heuristicNumber} updated!`,
        });
        setTimeout(() => {
            setToast({
                open: false,
                text: "",
            });
        }, 4000);
    }

    /**
     *
     * Setting the Note
     *
     * @param {*newText} string
     */

    async function handleChangeText(newText) {
        setText(newText);

        let scoreId, scoreValue, scoreData;

        if (empty) {
            scoreData = await standByData();
            console.log("standById", scoreData);

            scoreId = scoreData.id;
            scoreValue = score;
        } else {
            scoreId = currentScore.id;
            scoreValue = score;
        }

        processChangeText(
            {
                scoreId,
                scoreValue,
                scoreNote: newText,
            },
            MUTATION_SCORE
        );

        let dataNew = await waitForNewData();

        setToast({
            open: true,
            text: `Note for Heuristic ${dataNew.heuristic.heuristicNumber} updated!`,
        });
        // console.log("toastText", dataNew.note);
        setTimeout(() => {
            setToast({
                open: false,
                text: "",
            });
        }, 4000);
    }

    async function handleChangeEvidenceUrl(newText) {
        setEvidenceUrl(newText);

        let scoreId, scoreData;

        if (empty) {
            scoreData = await standByData();
            console.log("standByIdUrl", scoreData);

            scoreId = scoreData.id;
        } else {
            scoreId = currentScore.id;
        }

        processChangeUrl(
            {
                scoreId,
                evidenceUrl: newText,
            },
            MUTATION_SCORE_EVIDENCE
        );

        let dataNew = await waitForNewData();

        setToast({
            open: true,
            text: `Evidence for Heuristic ${dataNew.heuristic.heuristicNumber} updated!`,
        });
        // console.log("toastText", dataNew.note);
        setTimeout(() => {
            setToast({
                open: false,
                text: "",
            });
        }, 4000);
    }

    const scoreDescription = {
        0: { color: "#999999", text: "Not evaluated yet" },
        1: { color: "#bb0000", text: "Totally disagree" },
        2: { color: "#ff0000", text: "Disagree" },
        3: { color: "orange", text: "Neutral" },
        4: { color: "#78b312", text: "Agree" },
        5: { color: "#14a914", text: "Totally agree" },
    };

    return (
        <li className="flex mb-10 gap-5">
            <div>
                <b className="text-xl">{heuristic.heuristicNumber}</b>
            </div>
            <div>
                <h2 className="text-lg mb-2 font-bold">{heuristic.name}</h2>
                <p className="text-sm">{heuristic.description}</p>

                <div className="flex flex-col gap-3 justify-between">
                    <div>
                        <Range
                            type={"range"}
                            id={id}
                            min={0}
                            max={5}
                            value={score}
                            onChange={(ev) => handleChangeRange(ev)}
                        />
                        <p
                            className="text-sm text-slate-500"
                            style={{ color: scoreDescription[score].color }}
                        >
                            {scoreDescription[score].text}
                        </p>
                    </div>
                    <button
                        className={`font-bold py-1 pr-3 text-sm text-primary flex gap-2 ${
                            enable ? "opacity-100" : "opacity-40"
                        }`}
                        onClick={() => setBoxOpen(!boxOpen)}
                        disabled={!enable}
                    >
                        <svg
                            width="20"
                            height="23"
                            viewBox="0 0 20 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2 0.221802H18V12.2218H16V2.2218H2V18.2218H10V20.2218H0V0.221802H2ZM4 4.2218H14V6.2218H4V4.2218ZM14 8.2218H4V10.2218H14V8.2218ZM4 12.2218H11V14.2218H4V12.2218ZM17 17.2218H20V19.2218H17V22.2218H15V19.2218H12V17.2218H15V14.2218H17V17.2218Z"
                                fill="#1E77FC"
                            />
                        </svg>
                        {boxOpen ? "Close" : "Add Evidence"}{" "}
                        {(text || evidenceUrl) && "*"}
                    </button>

                    <Note
                        openBox={boxOpen}
                        currentScore={currentScore}
                        text={text}
                        evidenceUrl={evidenceUrl}
                        onChangeText={handleChangeText}
                        onChangeEvidenceUrl={handleChangeEvidenceUrl}
                        hid={heuristic.id}
                    />
                </div>
            </div>
            <div
                className={`transition fixed right-5 bottom-40 bg-green-600 text-white/80 flex items-center p-3 w-80 font-bold z-10 ${
                    toast.open ? "translate-y-20" : "translate-y-60"
                }`}
            >
                {toast.text}
            </div>
        </li>
    );
}

export default HeuristicItem;

function Note({
    openBox,
    text,
    evidenceUrl,
    onChangeText,
    onChangeEvidenceUrl,
    hid,
}) {
    const urlRef = useRef(null);
    const collapseRef = useRef(null);

    useEffect(() => {
        if (openBox) {
            collapseRef.current.style.display = "block";
            collapseRef.current.style.transition = "0.3s";
            urlRef.current.focus();

            setTimeout(() => {
                collapseRef.current.style.height = "240px";
                collapseRef.current.style.opacity = 1;
            }, 10);
        } else {
            collapseRef.current.style.height = "0px";
            collapseRef.current.style.opacity = 0;

            setTimeout(() => {
                collapseRef.current.style.display = "none";
            }, 300);
        }

        return;
    }, [openBox]);
    return (
        <div
            className={`flex flex-col gap-3 overflow-hidden justify-between`}
            ref={collapseRef}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label
                        className="text-slate-500"
                        htmlFor={"evidenceUrl_" + hid}
                    >
                        Evidence URL
                    </label>
                    <input
                        id={"evidenceUrl_" + hid}
                        type="text"
                        placeholder="https://"
                        value={evidenceUrl || ""}
                        onChange={(ev) => {
                            onChangeEvidenceUrl(ev.target.value);
                        }}
                        ref={urlRef}
                        className="w-full border border-slate-300 dark:border-slate-500 p-2 h-10 text-slate-500 dark:text-slate-300 rounded-md"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label
                        className="text-slate-500"
                        htmlFor={"noteText_" + hid}
                    >
                        Note
                    </label>
                    <textarea
                        id={"noteText_" + hid}
                        className="w-full border border-slate-300 dark:border-slate-500 p-2 h-28 text-slate-500 dark:text-slate-300 rounded-md"
                        rows="3"
                        value={text || ""}
                        onChange={(ev) => {
                            onChangeText(ev.target.value);
                        }}
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
