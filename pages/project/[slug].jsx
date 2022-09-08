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

const QUERY_PROJECTS = gql`
    query Projects($slug: String) {
        project(where: { slug: $slug }) {
            slug
            name
        }
    }
`;

function Project() {
    const router = useRouter();
    const { slug, tab } = router.query || "";

    const { data, loading, error } = useQuery(QUERY_PROJECTS, {
        variables: {
            slug,
        },
    });

    // console.log("url", router.asPath.split("#").pop());
    // console.log("data", data);

    if (slug === undefined) {
        return <div>UNDEFINED</div>;
    }

    if (loading) {
        return <div>LOADING</div>;
    }

    if (error) {
        return <div>DEU ERRO: {error.message}</div>;
    }

    if (data?.project === null) {
        return <div>PROJECT NOT FOUND</div>;
    }

    if (data?.project.slug !== slug) {
        return <div>NOT FOUND</div>;
    }

    return (
        <div className="bg-slate-100/70">
            <ProjectWrapper data={data}>
                <Header
                    className="mt-10"
                    // project={data?.project.name}
                    routes={{ slug, tab: "dash" }}
                />
                <main className="mt-10">
                    {tab === "dash" ? <Dashboard /> : <Evaluation />}
                </main>
                <footer>FOOTER</footer>
            </ProjectWrapper>
        </div>
    );
}

export default Project;
