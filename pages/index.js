import Head from "next/head";
import Image from "next/image";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import ClientOnly from "../lib/ClientOnly";
import HeuristicList from "../components/HeuristicList";
import Card from "../components/Card";
import Link from "next/link";

export default function Home(props) {
    return (
        <>
            <div className="flex flex-col max-w-5xl mx-auto">
                <div className="flex w-full justify-between my-10">
                    <Image
                        src={`/logo-58.svg`}
                        width={166}
                        height={58}
                        alt={`Heuristic Collector Logo`}
                    />

                    <Link href="/api/auth/login">
                        <a className="bg-primary hover:bg-primary/70 text-white/80 uppercase px-8 py-6 rounded-md font-bold h-1 flex items-center">
                            Log In
                        </a>
                    </Link>
                    <Link href="/api/auth/logout">
                        <a className=" hover:bg-primary/70 text-white/80 uppercase px-8 py-6 rounded-md font-bold h-1 flex items-center">
                            Log Out
                        </a>
                    </Link>
                </div>
                <div>sdsds</div>
            </div>
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
