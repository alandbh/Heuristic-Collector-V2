import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { ScoresWrapper } from "../../context/scores";

import { useProjectContext } from "../../context/project";
import HeuristicGroup from "../HeuristicGroup";

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
        return <div>LOADING</div>;
    }

    if (error) {
        return <div>SOMETHING WENT WRONG: {error.message}</div>;
    }
    if (data === undefined) {
        return null;
    }

    return (
        <ScoresWrapper>
            <div>
                {data.groups.map((group) => (
                    <HeuristicGroup group={group} key={group.id} />
                ))}
            </div>
        </ScoresWrapper>
    );
}

export default Evaluation;
