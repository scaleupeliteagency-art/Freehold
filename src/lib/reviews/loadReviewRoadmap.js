function normalizeStatus(record) {
  return String(record?.status || "").trim().toLowerCase();
}

function isDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function selectCurrent(records, includeCompleted = true) {
  return (
    records.find((record) => normalizeStatus(record) === "active") ||
    records.find((record) => normalizeStatus(record) === "pending") ||
    records.find(
      (record) => !["completed", "done"].includes(normalizeStatus(record))
    ) ||
    (includeCompleted ? records[0] : null) ||
    null
  );
}

async function getRows(label, query) {
  const { data, error } = await query;
  if (error) throw new Error(`Failed to load ${label}: ${error.message}`);
  return data || [];
}

async function getSavedRoadmap(supabase, systemId) {
  const { data: versions, error } = await supabase
    .from("system_versions")
    .select("snapshot")
    .eq("system_id", systemId)
    .order("created_at", { ascending: false });

  if (
    error?.code === "PGRST205" &&
    error.message?.includes("system_versions")
  ) {
    console.warn(
      "[ReviewFlow] Roadmap recovery is unavailable because public.system_versions is missing. Apply the pending Supabase migrations."
    );
    return { roadmap: null, snapshotTableMissing: true };
  }
  if (error) throw new Error(`Failed to load saved roadmap: ${error.message}`);

  return {
    roadmap:
      versions?.find((version) => version.snapshot?.roadmap)?.snapshot.roadmap ||
      null,
    snapshotTableMissing: false,
  };
}

function getRoadmapRocks(roadmap) {
  return roadmap?.rocks || roadmap?.quarter?.rocks || [];
}

function getRoadmapQuarterNumber(roadmap) {
  return typeof roadmap?.quarter === "number"
    ? roadmap.quarter
    : Math.floor(new Date().getMonth() / 3) + 1;
}

function getRoadmapYearNumber(roadmap) {
  return Number.isInteger(roadmap?.year)
    ? roadmap.year
    : new Date().getFullYear();
}

export async function loadReviewRoadmap(supabase, systemId) {
  let roadmap;
  let roadmapLoaded = false;
  let recovered = false;
  let snapshotTableMissing = false;

  const getRoadmap = async () => {
    if (!roadmapLoaded) {
      const saved = await getSavedRoadmap(supabase, systemId);
      roadmap = saved.roadmap;
      snapshotTableMissing = saved.snapshotTableMissing;
      roadmapLoaded = true;
    }
    return roadmap;
  };

  let years = await getRows(
    "year plans",
    supabase
      .from("year_plans")
      .select("*")
      .eq("system_id", systemId)
      .order("year_number", { ascending: false })
  );
  let year = selectCurrent(years);

  if (!year) {
    const savedRoadmap = await getRoadmap();
    if (savedRoadmap) {
      const { data, error } = await supabase
        .from("year_plans")
        .insert({
          system_id: systemId,
          year_number: getRoadmapYearNumber(savedRoadmap),
          status: "active",
        })
        .select()
        .single();
      if (error) throw new Error(`Failed to restore year plan: ${error.message}`);
      year = data;
      years = [data];
      recovered = true;
    }
  }

  let quarters = year
    ? await getRows(
        "quarters",
        supabase
          .from("quarters")
          .select("*")
          .eq("year_plan_id", year.id)
          .order("quarter_number", { ascending: false })
      )
    : [];
  let quarter = selectCurrent(quarters);

  if (!quarter) {
    const savedRoadmap = await getRoadmap();
    if (year && savedRoadmap) {
      const quarterNumber = getRoadmapQuarterNumber(savedRoadmap);
      const objective =
        savedRoadmap.quarterlyObjective?.name ||
        savedRoadmap.quarter?.objective ||
        null;
      const { data, error } = await supabase
        .from("quarters")
        .insert({
          year_plan_id: year.id,
          quarter_number: quarterNumber,
          objective,
          status: "active",
        })
        .select()
        .single();
      if (error) throw new Error(`Failed to restore quarter: ${error.message}`);
      quarter = data;
      quarters = [data];
      recovered = true;
    }
  }

  let rocks = quarter
    ? await getRows(
        "monthly rocks",
        supabase
          .from("monthly_rocks")
          .select("*")
          .eq("quarter_id", quarter.id)
          .order("month", { ascending: true })
      )
    : [];

  if (quarter && rocks.length === 0) {
    const savedRoadmap = await getRoadmap();
    const rockDefinitions = getRoadmapRocks(savedRoadmap).filter(
      (rock) => typeof rock.name === "string" && rock.name.trim()
    );

    if (rockDefinitions.length > 0) {
      const firstMonth = (getRoadmapQuarterNumber(savedRoadmap) - 1) * 3 + 1;
      const { data, error } = await supabase
        .from("monthly_rocks")
        .insert(
          rockDefinitions.map((rock, index) => ({
            quarter_id: quarter.id,
            name: rock.name.trim(),
            description: rock.desiredOutcome || rock.description || "",
            success_criteria: rock.successCriteria || null,
            month: firstMonth + index,
            deadline: isDateOnly(rock.deadline) ? rock.deadline : null,
            status: index === 0 ? "active" : "pending",
          }))
        )
        .select();
      if (error) throw new Error(`Failed to restore monthly rocks: ${error.message}`);
      rocks = data || [];
      recovered = true;
    }
  }

  const rock = selectCurrent(rocks);
  let milestones = rock
    ? await getRows(
        "weekly milestones",
        supabase
          .from("weekly_milestones")
          .select("*")
          .eq("monthly_rock_id", rock.id)
          .order("week_number", { ascending: true })
      )
    : [];

  if (rock && milestones.length === 0) {
    const savedRoadmap = await getRoadmap();
    const rockDefinition = getRoadmapRocks(savedRoadmap).find(
      (item) => item.name?.trim() === rock.name?.trim()
    );
    const milestoneDefinitions = (rockDefinition?.milestones || []).filter(
      (milestone) => typeof milestone.name === "string" && milestone.name.trim()
    );

    if (milestoneDefinitions.length > 0) {
      const { data, error } = await supabase
        .from("weekly_milestones")
        .insert(
          milestoneDefinitions.map((milestone, index) => ({
            monthly_rock_id: rock.id,
            week_number: Number(milestone.week ?? milestone.week_number) || index + 1,
            name: milestone.name.trim(),
            description: milestone.description || null,
            target: Number.isFinite(Number(milestone.target))
              ? Number(milestone.target)
              : null,
            deadline: isDateOnly(milestone.deadline) ? milestone.deadline : null,
            success_criteria: milestone.successCriteria || null,
            status: "pending",
          }))
        )
        .select();
      if (error) throw new Error(`Failed to restore weekly milestones: ${error.message}`);
      milestones = data || [];
      recovered = true;
    }
  }

  if (recovered) {
    console.info("[ReviewFlow] Restored missing roadmap records from the saved system version.");
  }

  return {
    year,
    quarter,
    rock,
    milestone: selectCurrent(milestones, false),
    snapshotTableMissing,
  };
}
