import HeuristicGroup from "../HeuristicGroup";
import Debug from "../../lib/debug";
import { useScoresContext } from "../../context/scores";

export default function GroupContainer({ data }) {
    const { allScores } = useScoresContext();
    console.log(allScores);
    return (
        <>
            <div className="flex gap-5">
                <div>
                    {data.groups.map((group) => (
                        <HeuristicGroup group={group} key={group.id} />
                    ))}
                </div>
                <div>
                    <h1 className="text-2xl">
                        {allScores.map((score) => score.scoreValue)}
                    </h1>
                    <Debug data={allScores} />
                </div>
            </div>
        </>
    );
}
