
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isAdmin = isAuthenticated && user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return <div>Accueil</div>;
}
