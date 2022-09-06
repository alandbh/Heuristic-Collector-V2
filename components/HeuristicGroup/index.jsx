import HeuristicItem from "../HeuristicItem";
import { useScoresContext } from "../../context/scores";
/**
 *
 * HEURISTIC GROUP
 *
 */

function HeuristicGroup({ group }) {
    const { allScores } = useScoresContext();

    const groupSores = allScores.filter(
        (score) => score.heuristic.group.name === group.name
    );
    const groupTotalSore = groupSores.reduce(
        (acc, current) => acc + current.scoreValue,
        0
    );

    return (
        <section>
            <header className="flex">
                <h1>{group.name}</h1>
                <div className="text-xl">
                    {groupTotalSore} / {5 * group.heuristic.length}{" "}
                    {(
                        (groupTotalSore / (5 * group.heuristic.length)) *
                        100
                    ).toFixed(1)}
                    %
                </div>
            </header>
            <ul>
                {group.heuristic.map((heuristicItem) => (
                    <HeuristicItem
                        key={heuristicItem.id}
                        id={heuristicItem.id}
                        heuristic={heuristicItem}
                    />
                ))}
            </ul>
        </section>
    );
}

export default HeuristicGroup;
