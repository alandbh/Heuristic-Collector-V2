import { useState } from "react";
import Range from "../Range";

function HeuristicItem({ heuristic }) {
    const [score, setScore] = useState(0);
    function handleChangeRange(ev) {
        console.log(ev.target.value);

        setScore(Number(ev.target.value));
    }
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
