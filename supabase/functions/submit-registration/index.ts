import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@^1";

const PRODUCTION_ORIGINS = new Set([
  "https://thebadmintonproject.com",
  "https://www.thebadmintonproject.com",
]);

const ALLOWED_PROGRAMS = new Set([
  "High-Performance Training",
  "Competition Team Training",
  "Intro & Developmental Training",
  "Athletic Development Training",
]);

const ALLOWED_LOCATIONS = new Set([
  "Agility Sports",
  "BNM Badminton",
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin || PRODUCTION_ORIGINS.has(origin)) return true;

  try {
    const url = new URL(origin);
    return url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

function stringValue(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function choiceArray(value: unknown, allowed: Set<string>): string[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;

  const choices = [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean),
  )];

  return choices.every((choice) => allowed.has(choice)) ? choices : null;
}

function json(body: object, status = 200): Response {
  return Response.json(body, { status });
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (request, context) => {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    if (!isAllowedOrigin(request.headers.get("origin"))) {
      return json({ ok: false, error: "Origin not allowed." }, 403);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid request body." }, 400);
    }

    if (stringValue(body.website ?? body._honey, 200)) {
      return json({ ok: true }, 201);
    }

    const firstName = stringValue(body.first_name, 80);
    const lastName = stringValue(body.last_name, 80);
    const email = stringValue(body.email, 254).toLowerCase();
    const phone = stringValue(body.phone, 40);
    const playerFirstName = stringValue(body.player_first_name, 80);
    const playerLastName = stringValue(body.player_last_name, 80);
    const message = stringValue(body.message, 2000);

    if (!firstName) return json({ ok: false, error: "First name is required." }, 400);
    if (!lastName) return json({ ok: false, error: "Last name is required." }, 400);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "A valid email is required." }, 400);
    }
    if (Boolean(playerFirstName) !== Boolean(playerLastName)) {
      return json({ ok: false, error: "Enter both the player's first and last name." }, 400);
    }

    let age: number | null = null;
    if (body.age !== undefined && body.age !== null && body.age !== "") {
      age = Number(body.age);
      if (!Number.isInteger(age) || age < 1 || age > 120) {
        return json({ ok: false, error: "Player age is invalid." }, 400);
      }
    }

    const programs = choiceArray(body.programs, ALLOWED_PROGRAMS);
    if (programs === null) {
      return json({ ok: false, error: "Invalid program selection." }, 400);
    }

    const locations = choiceArray(body.locations, ALLOWED_LOCATIONS);
    if (locations === null) {
      return json({ ok: false, error: "Invalid location selection." }, 400);
    }

    const { error } = await context.supabaseAdmin.from("registrations").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      player_first_name: playerFirstName || null,
      player_last_name: playerLastName || null,
      age,
      programs,
      locations,
      message: message || null,
    });

    if (error) {
      console.error("Registration insert failed:", error.code);
      return json({
        ok: false,
        error: "Registration could not be saved. Please try again.",
      }, 500);
    }

    return json({ ok: true }, 201);
  }),
};
