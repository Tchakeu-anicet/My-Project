import type {
  Gig,
  GigStatus,
} from "./gigTypes";

const GIGS_KEY = "jf_gigs";

function readGigs(): Gig[] {
  const raw =
    localStorage.getItem(
      GIGS_KEY
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? (parsed as Gig[])
      : [];
  } catch {
    return [];
  }
}

function writeGigs(
  gigs: Gig[]
): void {
  localStorage.setItem(
    GIGS_KEY,
    JSON.stringify(gigs)
  );
}

export function getGigs(): Gig[] {
  return readGigs();
}

export function getGig(
  id: string
): Gig | null {
  return (
    readGigs().find(
      (gig) => gig.id === id
    ) ?? null
  );
}

export function createGig(
  gig: Omit<
    Gig,
    "id" | "createdAt" | "status"
  >
): Gig {
  const newGig: Gig = {
    ...gig,

    id: `gig-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    status: "open",

    createdAt:
      new Date().toISOString(),
  };

  writeGigs([
    newGig,
    ...readGigs(),
  ]);

  window.dispatchEvent(
    new Event(
      "jf-gigs-updated"
    )
  );

  return newGig;
}

export function updateGig(
  id: string,
  updates: Partial<Gig>
): Gig | null {
  const gigs =
    readGigs();

  const index =
    gigs.findIndex(
      (gig) => gig.id === id
    );

  if (index === -1) {
    return null;
  }

  const updated: Gig = {
    ...gigs[index],
    ...updates,
  };

  gigs[index] = updated;

  writeGigs(gigs);

  window.dispatchEvent(
    new Event(
      "jf-gigs-updated"
    )
  );

  return updated;
}

export function deleteGig(
  id: string
): void {
  writeGigs(
    readGigs().filter(
      (gig) => gig.id !== id
    )
  );

  window.dispatchEvent(
    new Event(
      "jf-gigs-updated"
    )
  );
}

export function updateGigStatus(
  id: string,
  status: GigStatus
): Gig | null {
  return updateGig(id, {
    status,
  });
}