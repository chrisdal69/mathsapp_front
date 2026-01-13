import { useRouter } from "next/router";
import Home from "../components/Home";
import Nav from "../components/Nav";

function Page() {
  const { query, isReady } = useRouter();
  const repertoire = Array.isArray(query.repertoire)
    ? query.repertoire[0]
    : query.repertoire;

  if (!isReady) {
    return <main className="mt-12">Chargement...</main>;
  }

  return (
    <>
      <Nav bg="#e6eaea" selectedBg="#c2cbcf" />
      <Home repertoire={repertoire} />
    </>
  );
}

export default Page;
