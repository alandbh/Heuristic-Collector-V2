import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { gql, useQuery } from "@apollo/client";
import ClientOnly from "../../lib/ClientOnly";

import Link from "next/link";
import Dashboard from "../../components/Dashboard";
import Evaluation from "../../components/Evaluation";
import Header from "../../components/Header";
import { ProjectWrapper } from "../../context/project";
import { CredentialsWrapper } from "../../context/credentials";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const QUERY_PROJECTS = gql`
    query Projects($slug: String) {
        project(where: { slug: $slug }) {
            slug
            name
            id
        }
    }
`;

function Project({ user }) {
    const router = useRouter();
    const { slug, tab, player } = router.query || "";

    const { data, loading, error } = useQuery(QUERY_PROJECTS, {
        variables: {
            slug,
        },
    });

    if (slug === undefined) {
        return (
            <header>
                <div className="bg-primary flex justify-between px-5 items-center h-12"></div>
            </header>
        );
    }

    if (loading) {
        // return null;
        return (
            <header>
                <div className="bg-primary flex justify-between px-5 items-center h-12"></div>
                <div className="bg-white shadow-md px-5 py-3 h-20"></div>
                <main className="flex bg-slate-100 items-center h-[calc(100vh_-_126px)]">
                    {/* Loading ptoject... */}
                </main>
            </header>
        );
    }

    if (error) {
        return (
            <div>
                Something went wrong in loading this project {error.message}
            </div>
        );
    }

    if (data?.project === null) {
        return <div>PROJECT NOT FOUND</div>;
    }

    if (data?.project.slug !== slug) {
        return <div>NOT FOUND</div>;
    }

    // console.log("user", user);

    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50">
            <Head>
                <Head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta
                        name="viewport"
                        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                    />
                    <meta
                        name="description"
                        content="R/GA's Heuristic Collector"
                    />
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
            </Head>
            <CredentialsWrapper>
                <ProjectWrapper data={data}>
                    <Header
                        // className="mt-20"
                        // project={data?.project.name}
                        routes={{ slug, tab: "progress" }}
                    />
                    <main className="mt-10 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                        {tab === "progress" ? <Dashboard /> : <Evaluation />}
                    </main>
                    <footer className="py-10">{/* FOOTER */}</footer>
                </ProjectWrapper>
            </CredentialsWrapper>
        </div>
    );
}

export default withPageAuthRequired(Project);
