import { createContext, useContext } from "react";
import { gql, useQuery } from "@apollo/client";

const QUERY_PROJECTS = gql`
    query Projects($slug: String) {
        project(where: { slug: $slug }) {
            slug
            name
        }
    }
`;

const ProjectContext = createContext();

export function ProjectWrapper({ children, data }) {
    let sharedState = {
        /* whatever you want */
    };

    return (
        <ProjectContext.Provider value={data}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjectContext() {
    return useContext(ProjectContext);
}
