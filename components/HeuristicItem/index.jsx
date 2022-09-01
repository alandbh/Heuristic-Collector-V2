import { gql, useMutation } from "@apollo/client";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useScoresContext } from "../../context/scores";
import Range from "../Range";
import client from "../../lib/apollo";
import { debounce } from "../../lib/utils";

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
        }
    }
`;

/**
 *
 * Debounced function for processing changes on Range
 */
const processChange = debounce(
    (variables) => {
        console.log("Saving data func");
        doMutate(variables);
    },
    2000,
    false
);

async function doMutate(variables) {
    const { data } = await client.mutate({
        mutation: MUTATION_SCORE,
        variables,
    });
    if (data) {
        doPublic(data);
    }
}

async function doPublic(variables) {
    console.log(variables?.updateScore);
    const { data } = await client.mutate({
        mutation: MUTATION_PUBLIC,
        variables: { scoreId: variables?.updateScore.id },
    });
    console.log("resopp", data);
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
    const [text, setText] = useState(currentScore?.note);
    const { scores } = useScoresContext();
    const [boxOpen, setBoxOpen] = useState(false);

    const currentScore = scores.find(
        (score) => score.heuristic.heuristicNumber === heuristic.heuristicNumber
    );

    useEffect(() => {
        if (currentScore !== undefined) {
            setScore(currentScore.scoreValue);
            setText(currentScore.note);
        } else {
            setScore(0);
        }
    }, [currentScore]);

    /**
     *
     * Setting the Score
     *
     * @param {*event} ev
     */

    function handleChangeRange(ev) {
        setScore(Number(ev.target.value));
        processChange({
            scoreId: currentScore.id,
            scoreValue: Number(ev.target.value),
            scoreNote: currentScore.note,
        });
    }

    function handleChangeText(newText) {
        setText(newText);
        console.log(text);

        processChange({
            scoreId: currentScore.id,
            scoreValue: currentScore.scoreValue,
            scoreNote: newText,
        });
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
                    className="font-bold py-1 pr-3 text-sm text-primary flex gap-2"
                    onClick={() => setBoxOpen(!boxOpen)}
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
                    Add Note
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
                value={text}
                onChange={(ev) => {
                    onChangeText(ev.target.value);
                }}
            ></textarea>
        </div>
    );
}
