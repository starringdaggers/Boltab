import TimetableBuilder from "@/components/timetable/TimetableBuilder";

export default function NewTimetablePage() {
  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <h1 className="font-display text-3xl text-bistre font-semibold mb-1">
        New timetable
      </h1>
      <p className="text-vandyke mb-8">
        Name it, then add as many rows and columns as you need.
      </p>
      <TimetableBuilder />
    </div>
  );
}
