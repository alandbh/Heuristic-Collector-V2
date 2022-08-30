function HeuristicGroup(name, heuristicList) {
    return (
        <section>
            <header>
                <h1>{name}</h1>
            </header>
            <ul>
                <li className="flex">
                    <div>NUMBER</div>
                    <div>
                        <h2>HEURISTIC NAME</h2>
                        <p>HESCRIPTION</p>

                        <div>SLIDER</div>
                        <button>Add Note</button>
                    </div>
                </li>
            </ul>
        </section>
    );
}

export default HeuristicGroup;
