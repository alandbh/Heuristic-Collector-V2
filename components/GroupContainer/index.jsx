import HeuristicGroup from "../HeuristicGroup";
import Debugg from "../../lib/Debugg";
import { useScoresContext } from "../../context/scores";

export default function GroupContainer({ data }) {
    const { allScores } = useScoresContext();
    console.log(allScores);
    return (
        <>
            <div className="gap-5 max-w-3xl mx-auto md:grid grid-cols-3 bg-slate-100">
                <div className="md:col-span-2">
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
