import { useRouter } from "next/router";
import Home from "../components/Home";

function Page() {
  const { query, isReady } = useRouter();
  const repertoire = Array.isArray(query.repertoire)
    ? query.repertoire[0]
    : query.repertoire;

  if (!isReady) {
    return <main className="mt-12">Chargement...</main>;
  }

  return <Home repertoire={repertoire} />;
}

export default Page;
