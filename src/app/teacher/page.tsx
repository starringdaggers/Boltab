import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherOverview() {
  const session = await getSession();

  const teacher: {
    assignments: {
      id: string;
      class: { name: string };
      subject: { name: string };
    }[];
  } | null = session
    ? await db.teacher.findUnique({
        where: { userId: session.userId },
        include: { assignments: { include: { class: true, subject: true } } },
      })
    : null;

  return (
    <div className="p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Welcome, {session?.name}
      </h1>
      <p className="text-vandyke mb-8">
        Here's what you're assigned to teach this session.
      </p>

      {!teacher || teacher.assignments.length === 0 ? (
        <p className="text-vandyke">
          You haven't been assigned to any class/subject yet — ask an admin
          to set this up.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {teacher.assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white/40 border border-taupe/30 rounded-card p-5"
            >
              <p className="font-display text-xl text-bistre font-semibold">
                {a.subject.name}
              </p>
              <p className="text-vandyke text-sm">{a.class.name}</p>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/teacher/results"
        className="inline-block bg-choc hover:bg-choc-dark text-antique font-medium rounded-lg px-5 py-2.5 transition-colors"
      >
        Enter results →
      </Link>
    </div>
  );
}
