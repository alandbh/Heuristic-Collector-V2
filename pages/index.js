import Head from "next/head";
import Image from "next/image";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import ClientOnly from "../lib/ClientOnly";
import HeuristicList from "../components/HeuristicList";

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
    return (
        <>
            <ClientOnly>
                <HeuristicList query={playersQuery} />
            </ClientOnly>
        </>
    );
}

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
