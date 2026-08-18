import { EquipeForm } from "@/features/equipes/equipe-form";

export default function NovaEquipePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <EquipeForm />
      </div>
    </main>
  );
}