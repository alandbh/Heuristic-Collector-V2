import Head from "next/head";
import Image from "next/image";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import ClientOnly from "../lib/ClientOnly";
import HeuristicList from "../components/HeuristicList";
import Card from "../components/Card";

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
            thumbnail {
                url
            }
        }
    }
`;

export default function Home(props) {
    const { data, loading, error } = useQuery(QUERY_PROJECTS);
    console.log(data?.projects);
    return (
        <>
            <ClientOnly>
                {/* <HeuristicList query={heuristicQuery} /> */}
                {data?.projects?.map((proj) => (
                    <Card key={proj.id} data={proj} />
                ))}
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
