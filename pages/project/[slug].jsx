import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

function Project() {
    const router = useRouter();
    const { slug } = router.query || "";

    return (
        <>
            <h1>{slug}</h1>
        </>
    );
}

export default Project;
