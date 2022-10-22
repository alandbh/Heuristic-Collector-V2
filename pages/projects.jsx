import { gql, useQuery } from "@apollo/client";
import ClientOnly from "../lib/ClientOnly";
import Card from "../components/Card";
// import { withPageAuthRequired } from "@auth0/nextjs-auth0";
// import { useUser } from "@auth0/nextjs-auth0";
import Logo from "../components/Logo";
// import LoggedUser from "../components/LoggedUser";
import Link from "next/link";
import Head from "next/head";

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

function Projects(props) {
    const { data, loading, error } = useQuery(QUERY_PROJECTS);
    console.log(data?.projects);
    // console.log("withPageAuthRequired", props.user);
    // const { user, error: errorUser, isLoading } = useUser();

    // console.log("user", user);

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <meta name="description" content="R/GA's Heuristic Collector" />
                <meta name="theme-color" content="#dd0000" />
                <title>R/GA&apos;s Heuristic Collector</title>
                <link rel="manifest" href="/manifest.json" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link
                    rel="apple-touch-icon"
                    href="/apple-touch-icon.png"
                ></link>
                <link
                    rel="android-chrome-192x192"
                    href="/android-chrome-192x192.png"
                ></link>
            </Head>
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
                        {/* <LoggedUser
                            picture={useUser()?.user?.picture}
                            name={useUser()?.user?.given_name}
                            email={useUser()?.user?.email}
                            size={40}
                        /> */}
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
}

export default Projects;

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
