import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { gql, useQuery } from "@apollo/client";
import ClientOnly from "../../lib/ClientOnly";

import Link from "next/link";
import Dashboard from "../../components/Dashboard";
import Evaluation from "../../components/Evaluation";
import Header from "../../components/Header";

const QUERY_PROJECTS = gql`
    query {
        project(where: { slug: "retail-30" }) {
            slug
            name
        }
    }
`;

function Project() {
    const router = useRouter();
    const { slug, tab } = router.query || "";

    const { data, loading, error } = useQuery(QUERY_PROJECTS);

    // console.log("url", router.asPath.split("#").pop());
    console.log("data", slug);

    if (data?.project.slug !== slug) {
        return <div>NOT FOUND</div>;
    }

    return (
        <>
            <Header router={{ slug, tab: "dash" }} />
            <h1>PROJECT NAME: {data?.project.name}</h1>
            {tab === "dash" ? <Dashboard /> : <Evaluation />}
            <footer>FOOTER</footer>
        </>
    );
}

export default Project;
