import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { ScoresWrapper } from "../../context/scores";

import { useProjectContext } from "../../context/project";
import HeuristicGroup from "../HeuristicGroup";
import GroupContainer from "../GroupContainer";

const QUERY_GROUPS = gql`
    query GetGroups($projectSlug: String, $journeySlug: String) {
        groups(
            where: {
                project: { slug: $projectSlug }
                journeys_some: { slug: $journeySlug }
            }
        ) {
            id
            name
            description
            journeys(where: { slug: $journeySlug }) {
                name
            }
            heuristic {
                name
                id
                heuristicNumber
                description
            }
        }
    }
`;

function Evaluation() {
    const { project } = useProjectContext();
    const router = useRouter();

    const { data, loading, error } = useQuery(QUERY_GROUPS, {
        variables: {
            projectSlug: project.slug,
            journeySlug: router.query.journey,
        },
    });

    if (loading) {
        return <div className="text-red-500">LOADING EVALUATION</div>;
    }

    if (error) {
        return <div>SOMETHING WENT WRONG: {error.message}</div>;
    }
    if (data === undefined) {
        return null;
    }

    console.log("Evaluation", data);

    return (
        <ScoresWrapper>
            <GroupContainer data={data}></GroupContainer>
        </ScoresWrapper>
    );
}

export default Evaluation;
