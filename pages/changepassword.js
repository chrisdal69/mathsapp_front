"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import zxcvbn from "zxcvbn";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NODE_ENV = process.env.NODE_ENV;
const URL_BACK = process.env.NEXT_PUBLIC_URL_BACK;
const urlFetch = NODE_ENV === "production" ? URL_BACK : "http://localhost:3000";

// ✅ Schéma de validation
const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "8 caractères minimum")
    .matches(/[A-Z]/, "Une majuscule requise")
    .matches(/[a-z]/, "Une minuscule requise")
    .matches(/[0-9]/, "Un chiffre requis")
    .matches(/[^A-Za-z0-9]/, "Un caractère spécial requis")
    .required("Nouveau mot de passe obligatoire"),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("newPassword"), null],
      "Les mots de passe ne correspondent pas"
    )
    .required("Confirmation obligatoire"),
});

export default function ChangePassword() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Indicateurs de robustesse
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const newPassword = watch("newPassword", "");

  // ✅ Vérifie en direct la robustesse
  useEffect(() => {
    setPasswordRules({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    });
    setPasswordStrength(zxcvbn(newPassword).score);
  }, [newPassword]);

  // ✅ Labels et couleurs pour la jauge
  const getStrengthLabel = (score) => {
    const labels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
    const colors = ["#dc2626", "#f97316", "#eab308", "#22c55e", "#16a34a"];
    return (
      <div className="mt-2">
        <div className="h-2 rounded bg-gray-200 overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${(score + 1) * 20}%`,
              backgroundColor: colors[score],
            }}
          />
        </div>
        <p className="text-sm mt-1" style={{ color: colors[score] }}>
          {labels[score]}
        </p>
      </div>
    );
  };

  // ✅ Liste des règles dynamiques
  const renderPasswordRules = () => {
    const rules = [
      { key: "length", label: "Au moins 8 caractères" },
      { key: "upper", label: "Une majuscule" },
      { key: "lower", label: "Une minuscule" },
      { key: "number", label: "Un chiffre" },
      { key: "special", label: "Un caractère spécial (!, $, #, ...)" },
    ];
    return (
      <ul className="mt-3 space-y-1 text-sm">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={`flex items-center gap-2 ${
              passwordRules[rule.key] ? "text-green-600" : "text-gray-500"
            }`}
          >
            {passwordRules[rule.key] ? "✅" : "❌"} {rule.label}
          </li>
        ))}
      </ul>
    );
  };

  // ✅ Vérification si l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3000/users/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          router.push("/"); // redirige si non connecté ou token expiré
        }
      } catch (err) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  // ✅ Soumission du formulaire
   
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${urlFetch}/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: data.newPassword }),
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("Mot de passe changé avec succès ✅");
        reset();
        setPasswordStrength(0);
        setTimeout(() => router.push("/"), 1000);
      } else {
        setMessage(json.error || "Erreur lors du changement de mot de passe.");
      }
    } catch (err) {
      setMessage("Erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Changer le mot de passe
      </h2>

      {message && <p className="text-blue-600 text-center mb-4">{message}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nouveau mot de passe */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={passwordVisible ? "text" : "password"}
              {...register("newPassword")}
              className="w-full border rounded px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.newPassword && (
            <p className="text-sm text-red-600 mt-1">
              {errors.newPassword.message}
            </p>
          )}

          {renderPasswordRules()}
          {newPassword && getStrengthLabel(passwordStrength)}
        </div>

        {/* Confirmation */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={confirmVisible ? "text" : "password"}
              {...register("confirmPassword")}
              className="w-full border rounded px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setConfirmVisible(!confirmVisible)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting || isLoading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLoading ? "Mise à jour..." : "Changer le mot de passe"}
        </button>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            Retour Page Maths
          </Link>
        </div>
      </form>
    </div>
  );
}
