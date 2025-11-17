import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useEffect } from "react";
import HomeForm from "../../components/admin/HomeForm";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const isAdmin = isAuthenticated && user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/"); // bloque l'accès aux non-admin
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null; // ou un loader
  return <HomeForm />;
}
