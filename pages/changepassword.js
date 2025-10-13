"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import zxcvbn from "zxcvbn";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ Validation stricte du mot de passe (identique à signup)
const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "8 caractères minimum")
    .matches(/[A-Z]/, "1 majuscule requise")
    .matches(/[a-z]/, "1 minuscule requise")
    .matches(/[0-9]/, "1 chiffre requis")
    .matches(/[^A-Za-z0-9]/, "1 caractère spécial requis")
    .required("Mot de passe obligatoire"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Les mots de passe ne correspondent pas")
    .required("Confirmation obligatoire"),
});

export default function ChangePasswordPage() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [message, setMessage] = useState("");

  // 🧩 Protection de la page
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) router.push("/login");
      } catch {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  const newPassword = watch("newPassword", "");
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

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:3000/auth/changepassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword: data.newPassword }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("Mot de passe modifié avec succès ✅");
        setTimeout(() => router.push("/account"), 1500);
      } else {
        setMessage(json.error || json.message || "Erreur ❌");
      }
    } catch {
      setMessage("Erreur serveur ❌");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Changer le mot de passe</h2>
      {message && <p className="text-center text-sm text-gray-700 mb-4">{message}</p>}

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" noValidate>
        {/* Nouveau mot de passe */}
        <div className="mb-5">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={passwordVisible ? "text" : "password"}
              {...register("newPassword")}
              className={`w-full border rounded px-3 py-2 pr-10 ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              }`}
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
            <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
          )}
          {renderPasswordRules()}
          {newPassword && getStrengthLabel(passwordStrength)}
        </div>

        {/* Confirmation */}
        <div className="mb-5">
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              id="confirmNewPassword"
              type={confirmVisible ? "text" : "password"}
              {...register("confirmNewPassword")}
              className={`w-full border rounded px-3 py-2 pr-10 ${
                errors.confirmNewPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setConfirmVisible(!confirmVisible)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmNewPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isSubmitting ? "Envoi..." : "Valider"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/account" className="text-sm text-blue-600 hover:underline">
          Retour au compte
        </Link>
      </div>
    </div>
  );
}
