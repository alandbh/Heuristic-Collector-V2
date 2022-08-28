import Link from "next/link";

function Header({ router }) {
    return (
        <>
            <h1>PAGE HEADER</h1>
            <nav>
                <Link href={`/project/${router.slug}`}>Evaluation</Link>
                <Link href={`/project/${router.slug}?tab=${router.tab}`}>
                    Dashboard
                </Link>
            </nav>
        </>
    );
}

export default Header;
