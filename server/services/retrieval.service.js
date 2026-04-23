const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

// ── Query Expander ──────────────────────────────────────────
async function expandQuery(disease, query) {
  return {
    queries: [
      `${disease} ${query}`,
      `${disease} treatment therapy`,
      `${disease} clinical management`,
    ],
    primary: `${disease} ${query}`,
  };
}

// ── PubMed ──────────────────────────────────────────────────
async function fetchPubMed(query, maxResults = 100) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=pub+date&retmode=json`;
    const searchRes = await axios.get(searchUrl);
    const ids = searchRes.data.esearchresult.idlist;

    if (!ids || ids.length === 0) return [];

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(",")}&retmode=xml`;
    const fetchRes = await axios.get(fetchUrl);

    const parsed = parser.parse(fetchRes.data);
    const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];
    const articleArray = Array.isArray(articles) ? articles : [articles];

    return articleArray
      .map((article) => {
        const medline = article?.MedlineCitation;
        const articleData = medline?.Article;
        const pmid = medline?.PMID?.["#text"] || medline?.PMID;
        const title =
          articleData?.ArticleTitle?.["#text"] ||
          articleData?.ArticleTitle ||
          "No title";
        const abstract =
          articleData?.Abstract?.AbstractText?.["#text"] ||
          articleData?.Abstract?.AbstractText ||
          "No abstract available";
        const year =
          articleData?.Journal?.JournalIssue?.PubDate?.Year || "Unknown";

        const authorList = articleData?.AuthorList?.Author || [];
        const authors = Array.isArray(authorList)
          ? authorList
              .slice(0, 3)
              .map((a) => `${a.LastName || ""} ${a.ForeName || ""}`.trim())
              .join(", ")
          : "Unknown";

        return {
          id: pmid,
          title,
          abstract:
            typeof abstract === "string" ? abstract : JSON.stringify(abstract),
          authors,
          year,
          source: "PubMed",
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        };
      })
      .filter((a) => a.title !== "No title");
  } catch (err) {
    console.error("PubMed error:", err.message);
    return [];
  }
}

// ── OpenAlex ─────────────────────────────────────────────────
async function fetchOpenAlex(query, maxResults = 100) {
  try {
    const results = [];

    for (let page = 1; page <= 2; page++) {
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=50&page=${page}&sort=relevance_score:desc`;
      const res = await axios.get(url);
      const works = res.data.results || [];
      results.push(...works);
    }

    return results
      .slice(0, maxResults)
      .map((work) => ({
        id: work.id,
        title: work.display_name || "No title",
        abstract: work.abstract_inverted_index
          ? reconstructAbstract(work.abstract_inverted_index)
          : "No abstract available",
        authors: (work.authorships || [])
          .slice(0, 3)
          .map((a) => a.author?.display_name || "")
          .join(", "),
        year: work.publication_year || "Unknown",
        citationCount: work.cited_by_count || 0,
        source: "OpenAlex",
        url: work.primary_location?.landing_page_url || work.id,
      }))
      .filter((w) => w.title !== "No title");
  } catch (err) {
    console.error("OpenAlex error:", err.message);
    return [];
  }
}

function reconstructAbstract(invertedIndex) {
  try {
    const words = {};
    for (const [word, positions] of Object.entries(invertedIndex)) {
      positions.forEach((pos) => (words[pos] = word));
    }
    return Object.keys(words)
      .sort((a, b) => a - b)
      .map((k) => words[k])
      .join(" ");
  } catch {
    return "No abstract available";
  }
}

// ── ClinicalTrials ────────────────────────────────────────────
async function fetchClinicalTrials(disease, query) {
  try {
    const results = [];

    for (const status of ["RECRUITING", "COMPLETED"]) {
      const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(disease)}&query.term=${encodeURIComponent(query)}&filter.overallStatus=${status}&pageSize=30&format=json`;
      const res = await axios.get(url);
      const studies = res.data.studies || [];
      results.push(...studies);
    }

    return results
      .map((study) => {
        const proto = study?.protocolSection;
        const id = proto?.identificationModule?.nctId || "Unknown";
        const title =
          proto?.identificationModule?.officialTitle ||
          proto?.identificationModule?.briefTitle ||
          "No title";
        const status = proto?.statusModule?.overallStatus || "Unknown";
        const phase = proto?.designModule?.phases?.[0] || "Not specified";
        const eligibility =
          proto?.eligibilityModule?.eligibilityCriteria || "Not specified";
        const locations = proto?.contactsLocationsModule?.locations || [];
        const location = locations[0]
          ? `${locations[0].city || ""}, ${locations[0].country || ""}`.trim()
          : "Not specified";
        const contacts = proto?.contactsLocationsModule?.centralContacts || [];
        const contact = contacts[0]
          ? `${contacts[0].name || ""} - ${contacts[0].email || ""}`.trim()
          : "Not specified";

        return {
          id,
          title,
          status,
          phase,
          eligibility,
          location,
          contact,
          source: "ClinicalTrials.gov",
          url: `https://clinicaltrials.gov/study/${id}`,
        };
      })
      .filter((t) => t.title !== "No title");
  } catch (err) {
    console.error("ClinicalTrials error:", err.message);
    return [];
  }
}

// ── Re-Ranker ─────────────────────────────────────────────────
function rankPublications(publications, query) {
  const queryWords = query.toLowerCase().split(" ");
  const currentYear = new Date().getFullYear();

  return publications
    .map((pub) => {
      const text = `${pub.title} ${pub.abstract}`.toLowerCase();
      const relevanceScore =
        queryWords.filter((w) => text.includes(w)).length / queryWords.length;
      const recencyScore =
        pub.year !== "Unknown"
          ? 1 - (currentYear - parseInt(pub.year)) / 20
          : 0.3;
      const citationScore = pub.citationCount
        ? Math.log(pub.citationCount + 1) / Math.log(10000)
        : 0.3;
      const finalScore =
        0.45 * relevanceScore + 0.35 * recencyScore + 0.2 * citationScore;

      return { ...pub, score: finalScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

// ── Main Retrieval Function ───────────────────────────────────
async function retrieve(disease, query) {
  const expanded = await expandQuery(disease, query);

  const [pubmedResults, openAlexResults, trialsResults] =
    await Promise.allSettled([
      fetchPubMed(expanded.primary, 100),
      fetchOpenAlex(expanded.primary, 100),
      fetchClinicalTrials(disease, query),
    ]);

  const pubmed =
    pubmedResults.status === "fulfilled" ? pubmedResults.value : [];
  const openAlex =
    openAlexResults.status === "fulfilled" ? openAlexResults.value : [];
  const trials =
    trialsResults.status === "fulfilled" ? trialsResults.value : [];

  const allPublications = [...pubmed, ...openAlex];
  const rankedPublications = rankPublications(
    allPublications,
    `${disease} ${query}`,
  );
  const topTrials = trials.slice(0, 6);

  return {
    publications: rankedPublications,
    trials: topTrials,
    meta: {
      totalFetched: allPublications.length,
      pubmedCount: pubmed.length,
      openAlexCount: openAlex.length,
      trialsCount: trials.length,
    },
  };
}

module.exports = { retrieve };
