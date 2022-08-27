// import { Container } from './styles';

function Debug({ data }) {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default Debug;
