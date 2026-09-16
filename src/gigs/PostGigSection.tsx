import {
  useState,
  type FormEvent,
  type JSX,
} from "react";

import { createGig } from "./gigsStore";

import "./PostGigSection.css";

interface PostGigSectionProps {
  homeownerId: string;
  homeownerName: string;
  onCreated?: () => void;
}

export default function PostGigSection({
  homeownerId,
  homeownerName,
  onCreated,
}: PostGigSectionProps): JSX.Element {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [budget, setBudget] =
    useState("");

  const [error, setError] =
    useState<string>("");
  const [success, setSuccess] =
    useState<string>("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    const cleanDescription =
      description.trim();
    const cleanCategory =
      category.trim();
    const cleanLocation =
      location.trim();

    const numericBudget = Number(budget);

    if (!cleanTitle) {
      setError("Enter a gig title.");
      return;
    }

    if (!cleanDescription) {
      setError("Enter a description.");
      return;
    }

    if (!cleanCategory) {
      setError("Select a category.");
      return;
    }

    if (!cleanLocation) {
      setError("Enter the location.");
      return;
    }

    if (
      !Number.isFinite(numericBudget) ||
      numericBudget <= 0
    ) {
      setError("Enter a valid budget.");
      return;
    }

    try {
      createGig({
        homeownerId,
        homeownerName,
        title: cleanTitle,
        description: cleanDescription,
        category: cleanCategory,
        location: cleanLocation,
        budget: numericBudget,
      });

      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setBudget("");

      setSuccess(
        "Your gig has been posted successfully."
      );

      onCreated?.();
    } catch {
      setError(
        "Unable to post the gig. Please try again."
      );
    }
  };

  return (
    <section className="post-gig-page">
      <div className="post-gig-header">
        <span>POST A GIG</span>

        <h2>
          Find the right worker
          for your task.
        </h2>

        <p>
          Describe what you need and
          let qualified workers respond.
        </p>
      </div>

      <form
        className="post-gig-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <label>
          Gig title

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. Need an electrician for home wiring"
            autoComplete="off"
            required
          />
        </label>

        <label>
          Description

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Explain what you need..."
            rows={6}
            required
          />
        </label>

        <div className="post-gig-grid">
          <label>
            Category

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select category
              </option>

              <option value="Cleaning">
                Cleaning
              </option>

              <option value="Electrical">
                Electrical
              </option>

              <option value="Plumbing">
                Plumbing
              </option>

              <option value="Construction">
                Construction
              </option>

              <option value="Painting">
                Painting
              </option>

              <option value="Gardening">
                Gardening
              </option>

              <option value="Delivery">
                Delivery
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </label>

          <label>
            Location

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              placeholder="Douala"
              autoComplete="address-level2"
              required
            />
          </label>

          <label>
            Budget

            <input
              type="number"
              min="1"
              step="1"
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                )
              }
              placeholder="50000"
              required
            />
          </label>
        </div>

        {error && (
          <p
            className="post-gig-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="post-gig-success"
            role="status"
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          className="post-gig-submit"
        >
          Post Gig
        </button>
      </form>
    </section>
  );
}