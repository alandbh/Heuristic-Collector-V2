import {
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from "react";
import { useScoresContext } from "../../context/scores";
import Range from "../Range";

/**
 *
 * HEURISTIC ITEM
 *
 */

function HeuristicItem({ heuristic }) {
    const [score, setScore] = useState(0);
    const [isPending, startTransition] = useTransition();
    const { scores } = useScoresContext();

    const rangeValue = useDeferredValue(score);

    const currentScore = scores.find(
        (score) => score.heuristic.heuristicNumber === heuristic.heuristicNumber
    );

    useEffect(() => {
        console.log("CONTEXTP", currentScore);
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
        // console.log(ev.target.value);

        setScore(Number(ev.target.value));
        // console.log("PENDING", isPending);
    }

    useEffect(() => {
        setScoreOnDb(rangeValue);
    }, [rangeValue]);

    function setScoreOnDb(value) {
        console.log("DEFER", ((value * 1000000000) / 8) * 5432);
    }

    console.log("NORMAL", rangeValue);

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

/**
 *
 * HEURISTIC GROUP
 *
 */

function HeuristicGroup({ group }) {
    return (
        <section>
            <header>
                <h1>{group.name}</h1>
            </header>
            <ul>
                {group.heuristic.map((heuristicItem) => (
                    <HeuristicItem
                        key={heuristicItem.id}
                        heuristic={heuristicItem}
                    />
                ))}
            </ul>
        </section>
    );
}

export default HeuristicGroup;
