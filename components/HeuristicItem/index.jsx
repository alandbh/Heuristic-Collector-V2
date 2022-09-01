import { gql, useMutation } from "@apollo/client";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useScoresContext } from "../../context/scores";
import Range from "../Range";
import client from "../../lib/apollo";

function debounce(func, wait = 1000, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Returns a function, that, as long as it continues to be invoked, will only
// trigger every N milliseconds. If <code>immediate</code> is passed, trigger the
// function on the leading edge, instead of the trailing.
// function throttle(func, wait, immediate) {
//     var timeout;
//     return function () {
//         var context = this,
//             args = arguments;
//         var later = function () {
//             timeout = null;
//             if (!immediate) func.apply(context, args);
//         };
//         var callNow = immediate && !timeout;
//         if (!timeout) timeout = setTimeout(later, wait);
//         if (callNow) func.apply(context, args);
//     };
// }

function saveInput(variables) {
    console.log("Saving data");
    doMutate(variables);
}
const processChange = debounce(saveInput, 1000, false);

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
        }
    }
`;
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

function HeuristicItem({ heuristic }) {
    const [score, setScore] = useState(0);
    const [hasChanged, setHasChanged] = useState(false);
    const { scores } = useScoresContext();

    const defeScore = useDeferredValue(score);

    const currentScore = scores.find(
        (score) => score.heuristic.heuristicNumber === heuristic.heuristicNumber
    );

    useEffect(() => {
        if (currentScore !== undefined) {
            setScore(currentScore.scoreValue);
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
        setHasChanged(true);
        processChange({
            scoreId: currentScore.id,
            scoreValue: Number(ev.target.value),
            scoreNote: "nota interna2",
        });
    }

    /**
     *
     * Saving the score to Database
     */

    const [setScoreOnDb, { data, loading, error }] =
        useMutation(MUTATION_SCORE);

    // if (data) {
    //     console.log(data);
    // }
    const defChange = useDeferredValue(hasChanged);
    const defCurrentScore = useDeferredValue(currentScore);
    // const memoSave = useMemo(() => {

    // }, [hasChanged, currentScore, defeScore]);

    function save() {
        // console.log("mudou");
        if (hasChanged && currentScore && defeScore && !loading) {
            console.log("mudou");
            setScoreOnDb({
                variables: {
                    scoreId: currentScore.id,
                    scoreValue: defeScore,
                    scoreNote: "nota interna2",
                },
            });
        }
    }

    // const [updateScore, { data, loading, error }] =
    //     useMutation(MUTATION_PUBLIC);
    // const debScore = useDebounce(score, 1000);

    // useMemo(() => {
    //     if (defChange && defCurrentScore && defeScore && !loading) {
    //         console.log("EFFEct", debScore);

    //         setScoreOnDb({
    //             variables: {
    //                 scoreId: currentScore.id,
    //                 scoreValue: defeScore,
    //                 scoreNote: "nota interna2",
    //             },
    //         });
    //     }

    //     return null;
    // }, [
    //     defChange,
    //     defeScore,
    //     defCurrentScore,
    //     setScoreOnDb,
    //     loading,
    //     debScore,
    // ]);

    // useEffect(() => {
    // }, [debScore]);

    // useEffect(() => {

    //     if (currentScore !== undefined) {

    //     }
    // }, [defeScore, currentScore, setScoreOnDb]);

    // if (currentScore !== undefined) {
    // }

    return (
        <li className="flex">
            <div>
                <b>{heuristic.heuristicNumber}</b>
            </div>
            <div>
                <h2>{heuristic.name}</h2>
                <p>{heuristic.description}</p>

                <div>SLIDER</div>
                <Range
                    type={"range"}
                    min={0}
                    max={5}
                    value={score}
                    onChange={(ev) => handleChangeRange(ev)}
                />
                <button>Add Note</button>
            </div>
        </li>
    );
}

// Hook
function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(
        () => {
            // Update debounced value after delay
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            // Cancel the timeout if value changes (also on delay change or unmount)
            // This is how we prevent debounced value from updating if value is changed ...
            // .. within the delay period. Timeout gets cleared and restarted.
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay] // Only re-call effect if value or delay changes
    );
    return debouncedValue;
}

export default HeuristicItem;
