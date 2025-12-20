'use client';

export default function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="text-sm font-sans hover:bg-tb-navy/10 border border-tb-navy/20 px-3 py-2 rounded-lg transition text-tb-navy"
      >
        Cerrar sesión
      </button>
    </form>
  );
}

