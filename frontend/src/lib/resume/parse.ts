import { createId } from "@/lib/ids";
import {
  createEducationItem,
  createExperienceItem,
  createProjectItem,
} from "./defaults";

import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
} from "@/lib/types";

const BULLET_PREFIX = /^[\s]*[-•*–—]\s+/;

const DATE_RANGE =
  /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b\d{4})\s*[-–—]\s*(\b(?:Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\b\d{4}|Present|Current)/i;

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitBlocks(text: string): string[] {
  const trimmed = text.trim();

  if (!trimmed) return [];

  // Split by double newlines first
  const byNewlines = trimmed
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  // fallback if PDF extraction collapses spacing
  if (byNewlines.length > 1) {
    return byNewlines;
  }

  // fallback heuristic split using dates
  return trimmed
    .split(
      /(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[-–—])/,
    )
    .map((b) => b.trim())
    .filter(Boolean);
}

function parseDateRange(line: string): {
  startDate?: string;
  endDate?: string;
} {
  const match = line.match(DATE_RANGE);

  if (!match) return {};

  return {
    startDate: match[1]?.trim(),
    endDate: match[2]?.trim(),
  };
}

function isBullet(line: string): boolean {
  return BULLET_PREFIX.test(line);
}

function cleanBullet(line: string): string {
  return line.replace(BULLET_PREFIX, "").trim();
}


export function parseExperienceText(text: string): ExperienceItem[] {
  const blocks = splitBlocks(text);

  return blocks
    .map((block) => {
      const lines = normalizeLines(block);

      if (lines.length === 0) return null;

      const role = lines[0] ?? "";

      const dateLine =
        lines.find((line) => DATE_RANGE.test(line)) ?? "";

      const { startDate, endDate } = parseDateRange(dateLine);

      const dateIndex = lines.indexOf(dateLine);

      let company = "";
      let location = "";

      if (dateIndex >= 0) {
        company = lines[dateIndex + 1] ?? "";
        location = lines[dateIndex + 2] ?? "";
      }

      const bullets = lines
        .slice(dateIndex + 3)
        .map(cleanBullet)
        .filter(Boolean);

      return createExperienceItem({
        title: role,
        company,
        location,
        startDate,
        endDate,
        bullets,
      });
    })
    .filter(Boolean) as ExperienceItem[];
}

export function parseEducationText(text: string): EducationItem[] {
  const blocks = splitBlocks(text);

  return blocks
    .map((block) => {
      const lines = normalizeLines(block);

      if (lines.length === 0) return null;

      const institution = lines[0] ?? "";
      const location = lines[1] ?? "";
      const degree = lines[2] ?? "";

      const dateLine =
        lines.find((line) => DATE_RANGE.test(line)) ??
        lines.find((line) => /\b\d{4}\b/.test(line)) ??
        "";

      const { startDate, endDate } = parseDateRange(dateLine);

      const highlights = lines
        .slice(4)
        .map(cleanBullet)
        .filter(Boolean);

      return createEducationItem({
        institution,
        location,
        degree,
        startDate,
        endDate,
        highlights,
      });
    })
    .filter(Boolean) as EducationItem[];
}


export function parseProjectsText(text: string): ProjectItem[] {
  const blocks = splitBlocks(text);

  return blocks
    .map((block) => {
      const lines = normalizeLines(block);

      if (lines.length === 0) return null;

      const firstLine = lines[0] ?? "";

      // Example:
      // AI Travel Planning Assistant | GitHub

      const [namePart] = firstLine.split("|");

      const name = namePart?.trim() ?? "Untitled Project";

      const githubMatch = firstLine.match(
        /(https?:\/\/[^\s]+|github)/i,
      );

      const github = githubMatch?.[0];

      const techLine =
        lines.find((line) =>
          /technologies?:/i.test(line),
        ) ?? "";

      const technologies = techLine
        ? techLine
            .replace(/technologies?:/i, "")
            .split(/[,;|]/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const bullets = lines
        .filter((line) => isBullet(line))
        .map(cleanBullet)
        .filter(Boolean);

      const description =
        lines.find(
          (line) =>
            !isBullet(line) &&
            line !== firstLine &&
            line !== techLine,
        ) ?? "";

      return createProjectItem({
        name,
        github,
        technologies,
        description,
        bullets,
      });
    })
    .filter(Boolean) as ProjectItem[];
}



export function parseSkillsText(text: string): string[] {
  const trimmed = text.trim();

  if (!trimmed) return [];

  const lines = normalizeLines(trimmed);

  const skills = lines.flatMap((line) => {
    const cleaned = cleanBullet(line);

    // Remove category prefixes
    // Example:
    // Programming: Python, Java

    const withoutCategory = cleaned.includes(":")
      ? cleaned.split(":")[1]
      : cleaned;

    if (!withoutCategory) return [];

    return withoutCategory
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  });

  return [...new Set(skills)];
}



export function withStableIds<T extends { id: string }>(
  items: T[],
): T[] {
  return items.map((item) => ({
    ...item,
    id: item.id || createId(),
  }));
}