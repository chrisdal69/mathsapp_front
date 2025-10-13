"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/users", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
        console.log("dans account.js : ",json)

        if (res.ok && json.user) {
          setUser(json.user);
        } else {
          //router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setMessage("Déconnexion réussie ✅");
        setTimeout(() => router.push("/login"), 1000);
      } else {
        setMessage("Erreur lors de la déconnexion ❌");
      }
    } catch {
      setMessage("Erreur serveur ❌");
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-semibold mb-4">Mon compte</h2>

      {user && (
        <p className="text-gray-700 mb-6">
          Connecté en tant que : <strong>{user.email}</strong>
        </p>
      )}

      <div className="space-y-3">
        <Link
          href="/changepassword"
          className="block w-full py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
        >
          Changer le mot de passe
        </Link>

        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Se déconnecter
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
