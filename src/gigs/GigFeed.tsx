import {
  useEffect,
  useMemo,
  useState,
  type JSX,
} from "react";

import {
  getGigs,
} from './gigsStore';

import type {
  Gig,
} from "./gigTypes";

import "./GigFeed.css";

interface GigFeedProps {
  workerId: string;
  workerName: string;
  city?: string;
  onOpenGig?: (gig: Gig) => void;
}

export default function GigFeed({
  workerId,
  workerName,
  city,
  onOpenGig,
}: GigFeedProps): JSX.Element {
  const [gigs, setGigs] = useState<Gig[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const loadGigs = (): void => {
      setGigs(getGigs());
    };

    loadGigs();

    window.addEventListener(
      "jf-gigs-updated",
      loadGigs
    );

    return () => {
      window.removeEventListener(
        "jf-gigs-updated",
        loadGigs
      );
    };
  }, []);

  const availableGigs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return gigs.filter((gig) => {
      if (gig.status !== "open") {
        return false;
      }

      if (gig.homeownerId === workerId) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        gig.title,
        gig.description,
        gig.category,
        gig.location,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [gigs, search, workerId]);

  return (
    <section className="gig-feed">
      <div className="gig-feed-header">
        <div>
          <span className="gig-feed-kicker">
            FIND LOCAL WORK
          </span>

          <h2>
            Gigs near you
          </h2>

          <p>
            {city
              ? `Discover opportunities around ${city}.`
              : `Welcome, ${workerName}. Discover available local gigs.`}
          </p>
        </div>

        <div className="gig-feed-search">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search gigs..."
          />
        </div>
      </div>

      {availableGigs.length === 0 ? (
        <div className="gig-feed-empty">
          <div>◈</div>

          <h3>
            No gigs found
          </h3>

          <p>
            There are currently no
            matching gigs available.
          </p>
        </div>
      ) : (
        <div className="gig-feed-grid">
          {availableGigs.map((gig) => (
            <article
              className="gig-card"
              key={gig.id}
            >
              <div className="gig-card-top">
                <span>
                  {gig.category}
                </span>

                <strong>
                  {gig.status}
                </strong>
              </div>

              <h3>
                {gig.title}
              </h3>

              <p>
                {gig.description}
              </p>

              <div className="gig-card-meta">
                <span>
                  📍 {gig.location}
                </span>

                <span>
                  💰 {gig.budget}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  onOpenGig?.(gig)
                }
              >
                View gig
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}