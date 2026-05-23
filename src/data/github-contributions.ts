export interface ContributionMonthLabel {
  label: string;
  week: number;
}

export interface GithubContributionCalendar {
  contributionCount: number;
  monthLabels: ContributionMonthLabel[];
  weekData: number[][];
  profileUrl: string;
  sourceUrl: string;
}

const fallbackCalendar: GithubContributionCalendar = {
  contributionCount: 908,
  monthLabels: [
    { label: "May", week: 0 },
    { label: "Jun", week: 4 },
    { label: "Jul", week: 8 },
    { label: "Aug", week: 13 },
    { label: "Sep", week: 17 },
    { label: "Oct", week: 22 },
    { label: "Nov", week: 26 },
    { label: "Dec", week: 30 },
    { label: "Jan", week: 35 },
    { label: "Feb", week: 39 },
    { label: "Mar", week: 43 },
    { label: "Apr", week: 47 },
    { label: "May", week: 51 },
  ],
  weekData: [
    "0320300",
    "2432310",
    "3230230",
    "3433000",
    "0000320",
    "2333030",
    "3433320",
    "0232303",
    "0323330",
    "3432333",
    "0203332",
    "3332300",
    "3233032",
    "3202333",
    "0033303",
    "2303300",
    "3203030",
    "0032230",
    "2320323",
    "3203230",
    "0032030",
    "2303232",
    "3030203",
    "0302303",
    "3230200",
    "2030230",
    "0303003",
    "3200030",
    "2300202",
    "0030000",
    "0320020",
    "2330032",
    "3232330",
    "3323320",
    "3002303",
    "0202002",
    "3023200",
    "0200320",
    "2300022",
    "0020000",
    "0200002",
    "0030230",
    "2002000",
    "0403032",
    "0203323",
    "2432032",
    "0233330",
    "2432434",
    "4343333",
    "3233230",
    "2323332",
    "0232032",
    "3323323",
  ].map((week) => week.split("").map(Number)),
  profileUrl: "https://github.com/ethanz-code",
  sourceUrl: "https://github.com/users/ethanz-code/contributions",
};

const monthLabelPattern =
  /ContributionCalendar-label" colspan="(\d+)"[\s\S]*?<span aria-hidden="true"[^>]*>([^<]+)<\/span>/g;
const dayCellPattern =
  /data-date="(\d{4}-\d{2}-\d{2})" id="contribution-day-component-(\d)-(\d+)" data-level="([0-4])"/g;

const parseContributionCount = (html: string) => {
  const matched = html.match(/<h2[^>]*id="js-contribution-activity-description"[\s\S]*?(\d[\d,]*)\s+contributions/i);
  return matched ? Number.parseInt(matched[1].replaceAll(",", ""), 10) : fallbackCalendar.contributionCount;
};

const parseMonthLabels = (html: string) => {
  const labels: ContributionMonthLabel[] = [];
  let weekIndex = 0;

  for (const matched of html.matchAll(monthLabelPattern)) {
    const spanWeeks = Number.parseInt(matched[1], 10);
    labels.push({ label: matched[2], week: weekIndex });
    weekIndex += spanWeeks;
  }

  return labels.length > 0 ? labels : fallbackCalendar.monthLabels;
};

const parseWeekData = (html: string) => {
  const weeks = new Map<number, number[]>();

  for (const matched of html.matchAll(dayCellPattern)) {
    const row = Number.parseInt(matched[2], 10);
    const week = Number.parseInt(matched[3], 10);
    const level = Number.parseInt(matched[4], 10);
    const values = weeks.get(week) ?? Array.from({ length: 7 }, () => 0);
    values[row] = level;
    weeks.set(week, values);
  }

  if (weeks.size === 0) {
    return fallbackCalendar.weekData;
  }

  return [...weeks.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, values]) => values);
};

export const getGithubContributionCalendar = async (
  username = "ethanz-code",
): Promise<GithubContributionCalendar> => {
  const sourceUrl = `https://github.com/users/${username}/contributions`;
  const profileUrl = `https://github.com/${username}`;

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const html = await response.text();

    return {
      contributionCount: parseContributionCount(html),
      monthLabels: parseMonthLabels(html),
      weekData: parseWeekData(html),
      profileUrl,
      sourceUrl,
    };
  } catch (error) {
    console.warn("[github-contributions] falling back to static contribution calendar", error);
    return {
      ...fallbackCalendar,
      profileUrl,
      sourceUrl,
    };
  }
};
