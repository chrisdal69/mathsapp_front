import { useRouter } from "next/router";
import HomeForm from "../../components/admin/HomeForm";

function AdminPage() {
  const { query, isReady } = useRouter();
  const repertoire = Array.isArray(query.repertoire)
    ? query.repertoire[0]
    : query.repertoire;

  if (!isReady) {
    return <main className="mt-12">Chargement...</main>;
  }

  return <HomeForm nomRepertoire={repertoire} />;
}

export default AdminPage;

