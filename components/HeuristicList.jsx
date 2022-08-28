import React from "react";
import { useQuery, gql } from "@apollo/client";

// import { Container } from './styles';
const heuristicQuery = gql`
    query heuristics {
        name
        group {
            name
        }
    }
`;

function HeuristicList() {
    const { data, loading, error } = useQuery(heuristicQuery);

    // console.log(data);

    // if (loading) {
    //     return <h2>Loading</h2>;
    // }

    // if (error) {
    //     // console.error(error);
    //     return null;
    // }

    return <div>asaas</div>;
}

export default HeuristicList;
