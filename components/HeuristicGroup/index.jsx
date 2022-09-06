import HeuristicItem from "../HeuristicItem";

/**
 *
 * HEURISTIC GROUP
 *
 */

function HeuristicGroup({ group }) {
    return (
        <section>
            <header className="flex">
                <h1>{group.name}</h1>
                <div className="text-xl"></div>
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
