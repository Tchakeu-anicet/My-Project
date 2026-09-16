export interface Review {
  id: string;
  jobId: string;

  reviewerId: string;
  reviewerName: string;

  revieweeId: string;
  revieweeName: string;

  rating: number;
  comment: string;

  createdAt: string;
}

const REVIEWS_KEY =
  "jf_reviews";

function readReviews(): Review[] {
  const raw =
    localStorage.getItem(
      REVIEWS_KEY
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? (parsed as Review[])
      : [];
  } catch {
    return [];
  }
}

function writeReviews(
  reviews: Review[]
): void {
  localStorage.setItem(
    REVIEWS_KEY,
    JSON.stringify(reviews)
  );
}

export function getReviews(): Review[] {
  return readReviews();
}

export function getUserReviews(
  userId: string
): Review[] {
  return readReviews().filter(
    (review) =>
      review.revieweeId === userId
  );
}

export function createReview(
  data: Omit<
    Review,
    "id" | "createdAt"
  >
): Review {
  const review: Review = {
    ...data,
    id: `review-${Date.now()}`,
    createdAt:
      new Date().toISOString(),
  };

  writeReviews([
    review,
    ...readReviews(),
  ]);

  return review;
}

export function getAverageRating(
  userId: string
): number {
  const reviews =
    getUserReviews(userId);

  if (!reviews.length) {
    return 0;
  }

  const total =
    reviews.reduce(
      (sum, review) =>
        sum + review.rating,
      0
    );

  return Number(
    (total / reviews.length).toFixed(
      1
    )
  );
}