import HeuristicItem from "../HeuristicItem";
import { useScoresContext } from "../../context/scores";
import Donnut from "../Donnut";
/**
 *
 * HEURISTIC GROUP
 *
 */

function HeuristicGroup({ group }) {
    const { allScores } = useScoresContext();

    if (!allScores) {
        return null;
    }

    const groupSores = allScores?.filter(
        (score) => score.heuristic.group.name === group.name
    );
    const groupTotalSore = groupSores.reduce(
        (acc, current) => acc + current.scoreValue,
        0
    );

    return (
        <section>
            <header className="flex justify-between mb-6 items-center px-4">
                <h1 className="text-xl font-bold">
                    <div className="h-[5px] bg-primary w-10 mb-1"></div>
                    {group.name}
                </h1>
                <div className="text-lg flex items-center gap-5">
                    <b>
                        {groupTotalSore} of {5 * group.heuristic.length}
                    </b>

                    <Donnut
                        total={5 * group.heuristic.length}
                        sum={groupTotalSore}
                        radius={25}
                        thick={3}
                    ></Donnut>
                </div>
            </header>
            <ul className="bg-white py-8 px-4 pr-8 rounded-lg shadow-lg">
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
