import { useRouter } from "next/router";
import HomeForm from "../../components/admin/HomeForm";
import Nav from "../../components/Nav";

function AdminPage() {
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
      <HomeForm nomRepertoire={repertoire} />
    </>
  );
}

export default AdminPage;
