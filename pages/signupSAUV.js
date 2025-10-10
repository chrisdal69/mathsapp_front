"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import zxcvbn from "zxcvbn";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";

// ✅ Schéma de validation Yup
const schema = yup.object().shape({
  nom: yup
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .required("Le nom est obligatoire"),
  prenom: yup
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .required("Le prénom est obligatoire"),
  email: yup
    .string()
    .email("Adresse email invalide")
    .required("L'email est obligatoire"),
  password: yup
    .string()
    .min(8, "8 caractères minimum")
    .matches(/[A-Z]/, "Une majuscule est requise")
    .matches(/[a-z]/, "Une minuscule est requise")
    .matches(/[0-9]/, "Un chiffre est requis")
    .matches(/[^A-Za-z0-9]/, "Un caractère spécial est requis")
    .required("Mot de passe obligatoire"),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("password"), null],
      "Les mots de passe ne correspondent pas"
    )
    .required("Confirmez votre mot de passe"),
});

export default function SignupForm() {
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password", "");

  useEffect(() => {
    setPasswordRules({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
    setPasswordStrength(zxcvbn(password).score);
  }, [password]);

  const onSubmit = async (data, event) => {
    const formData = new FormData(event.target);
    try {
      const res = await fetch("http://localhost:3000/users/signup", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      console.log("Réponse du back:", data);
    } catch (err) {
      console.error("Erreur upload:", err);
      return;
    }
    reset();
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

  return (
    <div className="max-w-md mx-auto mt-10 rounded-xl shadow-lg p-6 bg-white">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Créer un compte
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        key={router.asPath}
        noValidate
      >
        {/* Champs leurres pour neutraliser l'autofill */}
        <input
          type="text"
          name="fakeuser"
          autoComplete="off"
          style={{ display: "none" }}
        />
        <input
          type="password"
          name="fakepass"
          autoComplete="new-password"
          style={{ display: "none" }}
        />
        {/* EMAIL */}
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
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
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* NOM */}
        <div className="mb-5">
          <label
            htmlFor="nom"
            className="block text-sm font-medium text-gray-700"
          >
            Nom
          </label>
          <input
            id="nom"
            type="text"
            {...register("nom")}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
              errors.nom ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.nom && (
            <p className="text-red-600 text-sm mt-1">{errors.nom.message}</p>
          )}
        </div>

        {/* PRÉNOM */}
        <div className="mb-5">
          <label
            htmlFor="prenom"
            className="block text-sm font-medium text-gray-700"
          >
            Prénom
          </label>
          <input
            id="prenom"
            type="text"
            {...register("prenom")}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 ${
              errors.prenom ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.prenom && (
            <p className="text-red-600 text-sm mt-1">{errors.prenom.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
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
          </div>

          {errors.password && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}

          {renderPasswordRules()}
          {password && getStrengthLabel(passwordStrength)}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirmer le mot de passe
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={confirmVisible ? "text" : "password"}
              {...register("confirmPassword")}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 pr-10 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setConfirmVisible(!confirmVisible)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isSubmitting ? "Envoi..." : "S'inscrire"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Retour sur login? </span>
        <Link
          href="/login"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Login
        </Link>
      </div>

      {/* 🔧 Neutralise le fond jaune de Chrome */}
      <style jsx global>{`
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px white inset !important;
          -webkit-text-fill-color: #000 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
