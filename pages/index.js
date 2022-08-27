import Head from "next/head";
import Image from "next/image";
import { gql } from "@apollo/client";
import client from "../lib/apollo";
import { useEffect } from "react";
import { fetchAPI } from "../lib/fetch";
import Debug from "../lib/debug";

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

    console.log(props.countries);
    return (
        <>
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
            <Debug data={props.countries} />
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
        heuristics {
            name
            group {
                name
            }
        }
    }
`;

export async function getStaticProps() {
    const { data } = await client.query({
        query: playersQuery,
    });

    return {
        props: {
            countries: data,
        },
    };
}
