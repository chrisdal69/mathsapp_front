import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import zxcvbn from "zxcvbn";
import { Eye, EyeOff } from "lucide-react"; // 👁️ import des icônes

// ✅ Schéma de validation Yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Adresse email invalide")
    .required("L'email est obligatoire"),

});

export default function SignupForm() {
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
    defaultValues: { email: "", },
  });



  useEffect(() => {
    reset({ email: "", password: "" });
  }, [reset]);

  const onSubmit = (data) => {
    console.log("✅ Données validées :", data);
    alert("Inscription réussie !");
  };

  return (
    <div className="max-w-md mx-auto mt-10 rounded-xl shadow-lg p-6 bg-white">
      <h2 className="text-2xl font-semibold text-center mb-6">Mot de pass oublié</h2>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" noValidate>
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

        {/* BUTTON */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isSubmitting ? "Envoi..." : "Reinitialiser le mot de pass"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Retour? </span>
        <Link
          href="/login"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Login
        </Link>
      </div>

      {/* 🔧 CSS pour neutraliser le fond jaune de Chrome */}
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
