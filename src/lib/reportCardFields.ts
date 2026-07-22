// Field labels for the report card's psychomotor & affective rating grids,
// matching the school's paper continuous assessment sheet. Ratings are 1-5.

export const PSYCHOMOTOR_SKILLS = [
  "Verbal Fluency",
  "Games",
  "Sport",
  "Computer",
  "Drawing & Painting",
  "Musical Skills",
  "Handwriting",
] as const;

export const AFFECTIVE_TRAITS = [
  "Punctuality",
  "Neatness",
  "Politeness",
  "Relationship with Peers",
  "Honesty",
  "Relationship with Teacher's",
  "Physical Development",
  "Mental Alertness",
  "Emotional Stability",
  "Adjustment in School",
  "Attentiveness",
  "Perseverance",
  "General Attitude & Habits",
] as const;

export const RATING_SCALE = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Very Good" },
  { value: 3, label: "Good" },
  { value: 2, label: "Fair" },
  { value: 1, label: "Poor" },
] as const;

export type RatingMap = Record<string, number>;
