import { gql, useMutation } from "@apollo/client";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useScoresContext } from "../../context/scores";
import { useRouter } from "next/router";
import Range from "../Range";
import client from "../../lib/apollo";
import { debounce, throttle } from "../../lib/utils";
import Debug from "../../lib/debug";

const initialScore = {};

function standById() {
    return new Promise((resolve, reject) => {
        const intervalGetItd = setInterval(() => {
            if (initialScore.id) {
                resolve(initialScore.id);

                stopListening();
            }
        }, 1000);

        function stopListening() {
            clearInterval(intervalGetItd);
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
        }
    }
`;

const MUTATION_PUBLIC = gql`
    mutation setScorePublic($scoreId: ID) {
        publishScore(where: { id: $scoreId }, to: PUBLISHED) {
            id
            scoreValue
            note
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
                evidenceUrl: "uuu"
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
        return doMutate(variables, gqlString, isCreate);
    },
    2000,
    false
);

const processChangeInital = debounce(
    async (variables, gqlString, isCreate = false) => {
        console.log("Saving data Initally");
        doMutate(variables, gqlString, isCreate);
    },
    2000,
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
        return doPublic(newId);
    }
}

async function doPublic(newId) {
    console.log("varr", newId);
    const { data } = await client.mutate({
        mutation: MUTATION_PUBLIC,
        variables: { scoreId: newId },
    });
    console.log("resopp", data);

    initialScore.id = await data.publishScore.id;
    initialScore.scoreValue = await data.publishScore.scoreValue;
    return data;
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

function HeuristicItem({ heuristic }) {
    const [score, setScore] = useState(0);
    const [empty, setEmpty] = useState(false);
    const [text, setText] = useState(currentScore?.note || "");
    const { scores } = useScoresContext();
    const [boxOpen, setBoxOpen] = useState(false);
    const router = useRouter();

    const currentScore = scores.find(
        (score) => score.heuristic.heuristicNumber === heuristic.heuristicNumber
    );

    useEffect(() => {
        // debugger;
        if (currentScore !== undefined) {
            setScore(currentScore.scoreValue);
            setText(currentScore.note);
        } else {
            setScore(0);
            setEmpty(true);
            console.log("Undefined????");
        }
    }, [currentScore]);

    /**
     *
     * Setting the Score
     *
     * @param {*event} ev
     */

    async function handleChangeRange(ev) {
        setScore(Number(ev.target.value));

        if (empty) {
            await processChangeInital(
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
            await processChange(
                {
                    scoreId: currentScore.id,
                    scoreValue: Number(ev.target.value),
                    scoreNote: currentScore.note,
                },
                MUTATION_SCORE
            );
        }
    }

    async function handleChangeText(newText) {
        setText(newText);

        let scoreId, scoreValue;

        if (empty) {
            scoreId = await standById();
            scoreValue = score;
        } else {
            scoreId = currentScore.id;
            scoreValue = score;
        }

        console.log("standById", scoreId);

        processChange(
            {
                scoreId,
                scoreValue,
                scoreNote: newText,
            },
            MUTATION_SCORE
        );
    }

    return (
        <li className="flex mb-10 gap-5 max-w-lg">
            <div>
                <b className="text-xl">{heuristic.heuristicNumber}</b>
            </div>
            <div>
                <h2 className="text-lg mb-2 font-bold">{heuristic.name}</h2>
                <p className="text-sm">{heuristic.description}</p>

                <Range
                    type={"range"}
                    min={0}
                    max={5}
                    value={score}
                    onChange={(ev) => handleChangeRange(ev)}
                />
                <button
                    className={`font-bold py-1 pr-3 text-sm text-primary flex gap-2 ${
                        score ? "opacity-100" : "opacity-40"
                    }`}
                    onClick={() => setBoxOpen(!boxOpen)}
                    disabled={!score}
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
                    Add Note {text && "*"}
                </button>
                <Note
                    openBox={boxOpen}
                    currentScore={currentScore}
                    text={text}
                    onChangeText={handleChangeText}
                />
            </div>
        </li>
    );
}

export default HeuristicItem;

function Note({ openBox, text, onChangeText }) {
    return (
        <div className={`mt-3 ${openBox ? "flex" : "hidden"}`}>
            <textarea
                className="w-full border border-slate-300"
                rows="4"
                value={text || ""}
                onChange={(ev) => {
                    onChangeText(ev.target.value);
                }}
            ></textarea>
        </div>
    );
}
