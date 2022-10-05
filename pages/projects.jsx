import { gql, useQuery } from "@apollo/client";
import ClientOnly from "../lib/ClientOnly";
import Card from "../components/Card";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useUser } from "@auth0/nextjs-auth0";
import Logo from "../components/Logo";
import LoggedUser from "../components/LoggedUser";
import Link from "next/link";

const GET_PLAYERS = gql`
    query MyQuery($playerSlug: String) {
        player(where: { slug: $playerSlug }) {
            name
            scores {
                journey {
                    slug
                }
                heuristic {
                    name
                    heuristicNumber
                }
                scoreValue
            }
        }
    }
`;

const playersQuery = gql`
    query {
        player(where: { slug: "magalu" }) {
            name
            slug
            project {
                name
            }
            scores(where: { journey: { slug: "desktop" } }) {
                heuristic {
                    heuristicNumber
                    name
                    description
                }
                scoreValue
            }
        }
    }
`;
const heuristicQuery = gql`
    query {
        heuristics(where: { group: { name: "1. Need Recognition" } }) {
            name
            group {
                name
            }
        }
    }
`;

const QUERY_PROJECTS = gql`
    query {
        projects {
            id
            name
            slug
            year
            thumbnail {
                url
            }
        }
    }
`;

export default withPageAuthRequired(function Projects(props) {
    const { data, loading, error } = useQuery(QUERY_PROJECTS);
    console.log(data?.projects);
    console.log("withPageAuthRequired", props.user);
    const { user, error: errorUser, isLoading } = useUser();

    console.log("user", user);

    return (
        <>
            <ClientOnly>
                {/* <HeuristicList query={heuristicQuery} /> */}
                {/* <Header /> */}
                <div className="flex px-10 w-full justify-between my-10">
                    <Link href={`/`}>
                        <a>
                            <Logo />
                        </a>
                    </Link>

                    <div className="flex items-center gap-5">
                        <LoggedUser
                            picture={useUser()?.user?.picture}
                            name={useUser()?.user?.given_name}
                            size={40}
                        />
                    </div>
                </div>
                <div className="m-10 mt-28 flex flex-wrap gap-10">
                    {data?.projects?.map((proj) => (
                        <Card key={proj.id} data={proj} />
                    ))}
                </div>
            </ClientOnly>
        </>
    );
});

// test

// export async function getStaticProps() {
//     const res = await client.query({
//         query: heuristicQuery,
//     });

//     return {
//         props: {
//             countries: res,
//         },
//     };
// }
