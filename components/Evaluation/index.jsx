import { useProjectContext } from "../../context/project";

function Evaluation() {
    const { project } = useProjectContext();

    return (
        <>
            <h1>Evaluation</h1>
        </>
    );
}

export default Evaluation;
