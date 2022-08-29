import Image from "next/image";
import Link from "next/link";

function Header({ router }) {
    return (
        <header className="bg-blue-500 flex justify-between px-5">
            <Link href={`/`}>
                <a>
                    <div className="py-1">
                        <Image
                            src={`/logo-white-35.svg`}
                            width={100}
                            height={35}
                            alt={`Back to Project Gallery`}
                        />
                    </div>
                </a>
            </Link>
            <nav>
                <Link href={`/project/${router.slug}`}>Evaluation</Link>
                <Link href={`/project/${router.slug}?tab=${router.tab}`}>
                    Dashboard
                </Link>
            </nav>
        </header>
    );
}

export default Header;
