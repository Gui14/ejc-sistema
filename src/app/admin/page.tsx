import { AdminLoginForm } from "@/features/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#090612]">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,_rgba(197,29,184,0.55),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(8,184,237,0.4),_transparent_35%),linear-gradient(135deg,_#26005c_0%,_#4310a2_45%,_#103dff_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
        <div className="w-full">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-200">
              EJC
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Painel administrativo
            </h1>

            <p className="mt-3 text-white/70">
              Acesse para gerenciar inscrições e convidados.
            </p>
          </div>

          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}