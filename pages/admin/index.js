import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Nav from "../../components/Nav";

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

  return (
    <div>
      {" "}
      <Nav bg="#ced5d5" selectedBg="#bec0b6" />
      <p>Pas utilisé pour le moment</p>
    </div>
  );
}
