import Head from "next/head";
import Image from "next/image";
import { gql, useQuery } from "@apollo/client";
import client from "../lib/apollo";
import { useEffect } from "react";
import { fetchAPI } from "../lib/fetch";
import Debug from "../lib/debug";
import ClientOnly from "../lib/ClientOnly";
import HeuristicList from "../components/HeuristicList";

const GET_PLAYERS = gql`
    query MyQuery($playerSlug: String) {
        player(where: { slug: "magalu" }) {
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
    query Heuristics {
        heuristics {
            name
            group {
                name
            }
        }
    }
`;

export default function Home(props) {
    // useEffect(() => {
    //     client
    //         .query({
    //             query: GET_PLAYERS,
    //         })
    //         .then((response) => {
    //             console.log(response);
    //         });
    // }, []);

    // const { data, loading, error } = useQuery(heuristicQuery);

    // console.log(data);

    // if (error) {
    //     console.error(error);
    //     return null;
    // }
    return (
        <>
            <ClientOnly>
                <h1 className="text-3xl font-bold underline">Hello world!</h1>
                <Debug data={props.countries} />
                {/* <HeuristicList /> */}
            </ClientOnly>
        </>
    );
}

// export async function getStaticProps() {
//   const data = await fetchAPI(`
//   {
//     posts {
//       slug
//     }
//   }
// `)

//     return {
//         props: {
//             countries: data,
//         },
//     };
// }

export async function getStaticProps() {
    const { data } = await client.query({
        query: heuristicQuery,
    });

    return {
        props: {
            countries: data,
        },
    };
}
