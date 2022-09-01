import HeuristicItem from "../HeuristicItem";

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
