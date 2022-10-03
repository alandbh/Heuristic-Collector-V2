import Head from "next/head";
import Image from "next/image";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import ClientOnly from "../lib/ClientOnly";
import HeuristicList from "../components/HeuristicList";
import Card from "../components/Card";
import Link from "next/link";
import Logo from "../components/Logo";

export default function Home(props) {
    return (
        <>
            <div className="flex flex-col max-w-5xl mx-auto">
                <div className="flex w-full justify-between my-10">
                    <Logo />

                    <Link href="/projects">
                        <a className="bg-primary hover:bg-primary/70 text-white/80 uppercase px-8 py-6 rounded-md font-bold h-1 flex items-center">
                            Log In
                        </a>
                    </Link>
                </div>
                <div className="grid grid-cols-8">
                    <div className="col-span-3">aaa</div>
                    <div className="col-span-5">
                        <P>
                            Spreadsheets are great for storing and visualizing
                            data.
                        </P>
                        <P>
                            It turns out that when we need to run a heuristic
                            evaluation, using a smartphone, tablet or even a
                            laptop, it is quite difficult to manually enter data
                            into these spreadsheets. Especially when there are
                            many columns.
                        </P>
                        <P className="font-bold text-2xl">
                            Now, Heuristic Collector comes to rescue.
                        </P>
                        <P>
                            It&apos;s an web app for UX evaluators collect and
                            save the observed data during the analysis.
                        </P>
                        <P>
                            The app (in MVP) allows you not only to insert the
                            heuristic score, but also to insert comments, paste
                            a link with screenshots, and even insert extra
                            findings that can be classified as Good, Bad or
                            Neutral.
                        </P>
                        <P>
                            Another advantage is that the color classification
                            of extra finds is now fully automated.
                        </P>
                    </div>
                </div>
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

function P(props) {
    return (
        <p className={`text-lg mb-4 ` + props.className}>{props.children}</p>
    );
}
