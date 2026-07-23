import { db } from "@/lib/db";

async function getCounts() {
  const [classes, subjects, terms, teachers, students, results] =
    await Promise.all([
      db.class.count(),
      db.subject.count(),
      db.term.count(),
      db.teacher.count(),
      db.student.count(),
      db.result.count(),
    ]);
  return { classes, subjects, terms, teachers, students, results };
}

export default async function AdminOverview() {
  const counts = await getCounts();

  const cards = [
    { label: "Classes", value: counts.classes },
    { label: "Subjects", value: counts.subjects },
    { label: "Terms", value: counts.terms },
    { label: "Teachers", value: counts.teachers },
    { label: "Students", value: counts.students },
    { label: "Results recorded", value: counts.results },
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        Overview
      </h1>
      <p className="text-vandyke mb-8">
        A snapshot of Boltab Brilliant Schools' portal data.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white/40 border border-taupe/30 rounded-card p-6"
          >
            <p className="font-mono text-xs tracking-wide text-vandyke uppercase mb-2">
              {card.label}
            </p>
            <p className="font-display text-4xl text-bistre font-semibold">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {counts.classes === 0 && (
        <p className="text-vandyke mt-8">
          Nothing set up yet — start by adding your classes and subjects,
          then create terms before you invite teachers or students.
        </p>
      )}
    </div>
  );
}
