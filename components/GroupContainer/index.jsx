import HeuristicGroup from "../HeuristicGroup";
import Debugg from "../../lib/Debugg";
import { useScoresContext } from "../../context/scores";

export default function GroupContainer({ data }) {
    const { allScores } = useScoresContext();
    console.log("all", allScores);

    if (allScores.length === 0) {
        return (
            <div>
                <h1 className="text-2xl">
                    This player doens`t have this selected journey.
                </h1>
                <p>Please, select another journey / player</p>
            </div>
        );
    }
    return (
        <>
            <div className="gap-5 max-w-5xl mx-auto md:grid grid-cols-3 ">
                <div className="md:col-span-2 flex flex-col gap-20">
                    {data.groups.map((group) => (
                        <HeuristicGroup group={group} key={group.id} />
                    ))}
                </div>
                <div>
                    <h1 className="text-2xl">Categories</h1>
                    {/* <Debugg data={allScores} /> */}
                </div>
            </div>
        </>
    );
}
