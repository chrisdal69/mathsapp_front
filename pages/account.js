import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, clearAuth } from "../reducers/authSlice";

export default function Account() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const response = await res.json();
        setMessage(response.message);
        dispatch(clearAuth());
        setTimeout(() => router.push("/login"), 1000);
      } else {
        setMessage("Erreur lors de la déconnexion.");
      }
    } catch {
      setMessage("Erreur serveur.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 rounded-xl shadow-lg p-6 bg-white text-center">
      <h2 className="text-2xl font-semibold mb-6">Mon compte</h2>
      {user &&<h2 className="text-2xl  mb-6">{user.nom} {user.prenom}</h2>}
      {message && <p className="text-blue-600 mb-4">{message}</p>}

      <button
        onClick={handleLogout}
        className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 mb-4"
      >
        Logout
      </button>

      <Link
        href="/changepassword"
        className="inline-block py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Changer le mot de passe
      </Link>
    </div>
  );
}
