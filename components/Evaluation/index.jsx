import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Spinner from "../Spinner";
import { ScoresWrapper } from "../../context/scores";

import { useProjectContext } from "../../context/project";
// import { useCredentialsContext } from "../../context/credentials";
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
            heuristic(first: 10000) {
                name
                id
                heuristicNumber
                group {
                    name
                }
                description
                journeys {
                    slug
                }
                not_applicaple_players {
                    slug
                }
            }
        }
    }
`;

function Evaluation() {
    const { currentProject } = useProjectContext();
    const router = useRouter();

    const { data, loading, error } = useQuery(QUERY_GROUPS, {
        variables: {
            projectSlug: currentProject.slug,
            journeySlug: router.query.journey,
        },
    });

    // const dataToPass = useMemo(() => data, [data]);

    // console.log("Evaluation", useCredentialsContext());

    if (loading) {
        return (
            <div className="h-[calc(100vh_-_126px)] flex flex-col items-center justify-center">
                <Spinner radius={50} thick={7} colorClass="primary" />
            </div>
        );
        return <div className="text-red-500">LOADING EVALUATION</div>;
    }

    if (error) {
        return <div>SOMETHING WENT WRONG: {error.message}</div>;
    }
    if (data === undefined) {
        return null;
    }

    // console.log({ data });

    return (
        <ScoresWrapper>
            <GroupContainer data={data}></GroupContainer>
        </ScoresWrapper>
    );
}

export default Evaluation;
