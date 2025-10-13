import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";

// ✅ Schéma de validation Yup
const schema = yup.object().shape({
  email: yup.string().email("Adresse email invalide").required("L'email est obligatoire"),
  password: yup.string().required("Mot de passe obligatoire"),
});

export default function LoginPage() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // --- Vérifie la session à l’arrivée (si cookie JWT existe côté serveur) ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // --- Formulaire de connexion ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("Connexion réussie ✅");
        setIsLoggedIn(true);
        reset();
      } else {
        setMessage(json.error || json.message || "Erreur de connexion ❌");
      }
    } catch (err) {
      setMessage("Erreur serveur.");
    }
  };

  // --- Déconnexion ---
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setIsLoggedIn(false);
        setMessage("Déconnexion réussie ✅");
      }
    } catch (err) {
      setMessage("Erreur lors de la déconnexion ❌");
    }
  };

  // --- Changement de mot de passe ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage("Les nouveaux mots de passe ne correspondent pas ❌");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/auth/changepassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("Mot de passe modifié avec succès ✅");
        setShowChangePassword(false);
      } else {
        setMessage(json.error || json.message || "Erreur lors du changement de mot de passe ❌");
      }
    } catch (err) {
      setMessage("Erreur serveur ❌");
    }
  };

  // --- Affichage ---
  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 rounded-xl shadow-lg p-6 bg-white">
      {!isLoggedIn ? (
        <>
          <h2 className="text-2xl font-semibold text-center mb-6">Se loguer</h2>

          <form key={router.asPath} onSubmit={handleSubmit(onSubmit)} autoComplete="off" noValidate>
            <input type="text" name="fakeuser" autoComplete="off" style={{ display: "none" }} />
            <input type="password" name="fakepass" autoComplete="new-password" style={{ display: "none" }} />

            {/* EMAIL */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* PASSWORD */}
            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  {...register("password")}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 pr-10 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="mt-2 text-right">
                  <Link href="/forgot" className="text-sm text-blue-600 hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSubmitting ? "Envoi..." : "Se loguer"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Pas encore inscrit ? </span>
            <Link href="/signup" className="text-sm font-medium text-blue-600 hover:underline">
              Inscription
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-center mb-6">Bienvenue 👋</h2>
          <div className="space-y-4 text-center">
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              Se déconnecter
            </button>

            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="w-full py-2 rounded-lg bg-gray-200 font-semibold hover:bg-gray-300"
            >
              {showChangePassword ? "Annuler" : "Changer le mot de passe"}
            </button>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Valider
                </button>
              </form>
            )}
          </div>
        </>
      )}

      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
}
