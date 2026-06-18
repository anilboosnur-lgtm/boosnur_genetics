import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "outputs";
const outputPath = `${outputDir}/boosnur_genetics_seed_buyer_outreach_mail_merge.xlsx`;

const today = "2026-06-16";

const buyers = [
  ["Enza Zaden", "Netherlands", "Global vegetable seed company", "Tomato, pepper, cucumber, onion, leafy vegetables", "High", "Production / sourcing / regional procurement", "info@enzazaden.com", "+31 (0)228 350100", "https://www.enzazaden.com/", "https://www.enzazaden.com/contact", "Official website / SeedQuest vegetable supplier category", "Ask if they qualify new contract seed production partners in India", "Avoid claiming export history; offer capability discussion and trial program", "Not contacted"],
  ["Rijk Zwaan", "Netherlands", "Global vegetable seed company", "Tomato, pepper, cucumber, leafy vegetables", "High", "Production / sourcing team", "Use official contact form", "+31 174 532300", "https://www.rijkzwaan.com/", "https://www.rijkzwaan.com/contact", "Official website / SeedQuest vegetable supplier category", "Ask for the right contact for external production partners", "Strong fit, but large companies need formal vendor onboarding", "Not contacted"],
  ["HM.CLAUSE", "France / USA", "Global vegetable seed company", "Tomato, pepper, melon, watermelon, squash", "High", "Production / procurement / regional office", "Use official contact form", "Use regional contact page", "https://hmclause.com/", "https://hmclause.com/contact/", "Official website / SeedQuest vegetable supplier category", "Position as India-based contract seed production startup", "Use concise capability note and crop list", "Not contacted"],
  ["Sakata Seed India / Sakata Global", "India / Japan / USA", "Vegetable and flower seed company", "Tomato, hot pepper, sweet pepper, cucurbits, brassicas", "High", "India office / production sourcing", "Use official contact page", "+91 124 4376941 / 4376942 / 4146401", "https://www.sakata.com/", "https://www.sakata.com/", "Official website / SeedQuest vegetable supplier category", "Start with India office; ask for production or sourcing department", "Good because India presence may understand Karnataka production", "Not contacted"],
  ["BASF Nunhems", "Netherlands / Global", "Global vegetable seed company", "Tomato, pepper, cucumber, melon, onion, watermelon", "High", "Vegetable seeds sourcing / production", "Use official contact form", "Use official regional contact", "https://www.nunhems.com/", "https://www.nunhems.com/global/en/contact.html", "Official website / SeedQuest vegetable supplier category", "Ask if they onboard external seed production partners", "Large buyer; formal vendor qualification likely", "Not contacted"],
  ["Syngenta Vegetable Seeds", "Switzerland / Global", "Global vegetable seed company", "Tomato, pepper, cucurbits, brassicas, leafy vegetables", "High", "Production / supply chain / India office", "Use official contact form", "Use local office contact", "https://www.syngentavegetables.com/", "https://www.syngentavegetables.com/contact", "Official website / SeedQuest vegetable supplier category", "Ask for production sourcing contact for India", "Large buyer; lead may need routing", "Not contacted"],
  ["Bayer / Seminis Vegetable Seeds", "Germany / USA / Global", "Global vegetable seed brand", "Tomato, pepper, watermelon, onion, brassicas", "High", "Vegetable seed production / supplier relations", "Use official contact form", "Use regional contact", "https://www.seminis.com/", "https://www.seminis.com/contact-us/", "Official website / SeedQuest vegetable supplier category", "Ask whether they accept new production partner introductions", "Use formal company profile once ready", "Not contacted"],
  ["Bejo Seeds", "Netherlands / USA", "Vegetable seed company", "Onion, carrot, cabbage, beet, brassicas", "Medium", "Production / procurement / regional sales", "info@bejoseeds.com", "+1 805 473 2199", "https://www.bejoseeds.com/", "https://www.bejoseeds.com/contact/", "Official website / SeedQuest vegetable supplier category", "Approach as vegetable seed production partner", "Not strongest tomato/pepper fit, but credible global target", "Not contacted"],
  ["Vilmorin-Mikado", "France / Japan / Global", "Vegetable seed company", "Tomato, pepper, carrot, lettuce, brassicas", "High", "Production / sourcing / regional office", "Use official contact form", "Use official country contacts", "https://www.vilmorinmikado.com/", "https://www.vilmorinmikado.com/contact/", "Official website / SeedQuest vegetable supplier category", "Ask for production partner qualification route", "Good fit for vegetable seeds", "Not contacted"],
  ["Hazera", "Netherlands / Israel / Global", "Vegetable seed company", "Tomato, pepper, onion, watermelon, cabbage", "High", "Production / sourcing / regional office", "Use official contact form", "Use official contact page", "https://www.hazera.com/", "https://www.hazera.com/contact/", "Official website / SeedQuest vegetable supplier category", "Ask for India production sourcing contact", "Mention Davangere, Karnataka farming network", "Not contacted"],
  ["Takii Seed", "Japan / USA / Global", "Vegetable and flower seed company", "Tomato, pepper, melon, cabbage, carrot", "Medium", "Production / sourcing / sales office", "info@takii.com", "+1 831 443 4901", "https://www.takii.com/", "https://www.takii.com/contact/", "Official website / SeedQuest vegetable supplier category", "Ask for production sourcing contact", "Could route through USA contact to global team", "Not contacted"],
  ["Tozer Seeds", "United Kingdom / USA", "Vegetable seed company", "Pepper, squash, leafy vegetables, brassicas", "Medium", "Sales / production sourcing", "sales@tozerseedsamerica.com", "+1 805 922 6300", "https://www.tozerseeds.com/", "https://www.tozerseeds.com/contact/", "Official website / SeedQuest vegetable supplier category", "Approach for trial production or sourcing discussion", "Smaller than majors; may be more reachable", "Not contacted"],
  ["East-West Seed", "Thailand / India / Global South", "Vegetable seed company", "Tomato, chilli, okra, gourds, cucurbits", "High", "India office / production / procurement", "Use official contact form", "Use local office contact", "https://www.eastwestseed.com/", "https://www.eastwestseed.com/contact-us/", "Official website / SeedQuest vegetable supplier category", "Strong fit for India and tropical vegetable production", "Start with India/regional office", "Not contacted"],
  ["Known-You Seed", "Taiwan / Global", "Vegetable seed company", "Tomato, hot pepper, sweet pepper, watermelon, melon", "High", "Production / export sourcing", "Use official contact form", "Use official contact page", "https://www.knownyou.com/", "https://www.knownyou.com/en/contact", "Official website / SeedQuest vegetable supplier category", "Offer India-based contract production and sourcing discussion", "Good Asian vegetable seed target", "Not contacted"],
  ["Nong Woo Bio", "South Korea", "Vegetable seed company", "Pepper, tomato, radish, cabbage, watermelon", "High", "Production / overseas sourcing", "Use official contact form", "Use official contact page", "https://www.nongwoobio.co.kr/", "https://www.nongwoobio.co.kr/", "Official website / SeedQuest vegetable supplier category", "Ask for overseas production partner route", "Good fit for chilli/pepper programs", "Not contacted"],
  ["Asia Seed", "South Korea", "Vegetable seed company", "Hot pepper, tomato, cabbage, radish, watermelon", "Medium", "Production / export sourcing", "Use official contact form", "Use official contact page", "https://www.asiaseed.net/", "https://www.asiaseed.net/", "Official website / SeedQuest vegetable supplier category", "Approach as India production partner", "Good Asian target", "Not contacted"],
  ["United Genetics", "Italy / USA", "Vegetable seed company", "Tomato, pepper, watermelon, melon", "High", "Production / sourcing / sales", "Use official contact form", "Use official contact page", "https://www.unitedgenetics.com/", "https://www.unitedgenetics.com/contact/", "Official website / SeedQuest vegetable supplier category", "Direct fit for tomato and pepper programs", "May respond better to crop-specific proposal", "Not contacted"],
  ["Tokita Seed", "Japan", "Vegetable seed company", "Tomato, pepper, squash, leafy vegetables", "Medium", "Production / export sourcing", "Use official contact form", "Use official contact page", "https://www.tokitaseed.co.jp/", "https://www.tokitaseed.co.jp/en/", "Official website / SeedQuest vegetable supplier category", "Ask for production partner introduction route", "Use short email and attach profile later", "Not contacted"],
  ["Namdhari Seeds", "India", "Vegetable seed company", "Tomato, chilli, capsicum, cucurbits, okra", "High", "Production / sourcing / business development", "Use official contact form", "Use official contact page", "https://www.namdhariseeds.com/", "https://www.namdhariseeds.com/contact-us/", "Official website / SeedQuest vegetable supplier category", "Approach as Karnataka-based contract production partner", "Strong local relevance", "Not contacted"],
  ["Mahyco Private Limited", "India", "Seed company", "Vegetables, field crops, cotton, rice", "Medium", "Production / procurement", "info@mahyco.com", "+91 2482 254777", "https://www.mahyco.com/", "https://www.mahyco.com/contact-us/", "Official website / SeedQuest vegetable supplier category", "Ask for vegetable seed sourcing/production contact", "Good India target; may be broad portfolio", "Not contacted"],
  ["Rasi Seeds", "India", "Seed company", "Vegetables and field crops", "Medium", "Production / procurement", "Use official contact form", "Use official contact page", "https://www.rasiseeds.com/", "https://www.rasiseeds.com/contact-us/", "Official website", "Ask for vegetable seeds production/procurement team", "Good Indian target", "Not contacted"],
  ["Nuziveedu Seeds", "India", "Seed company", "Vegetables and field crops", "Medium", "Production / procurement", "Use official contact form", "Use official contact page", "https://www.nuziveeduseeds.com/", "https://www.nuziveeduseeds.com/contact-us/", "Official website", "Ask for seed production/procurement contact", "May be more field-crop focused", "Not contacted"],
  ["Advanta Seeds / UPL", "India / Global", "Seed company", "Vegetables and field crops", "Medium", "Production / sourcing", "Use official contact form", "Use official contact page", "https://www.advantaseeds.com/", "https://www.advantaseeds.com/contact-us/", "Official website", "Approach India team for production partnership", "Large corporate route", "Not contacted"],
  ["Ankur Seeds", "India", "Seed company", "Vegetables and field crops", "Medium", "Production / procurement", "Use official contact form", "Use official contact page", "https://ankurseeds.com/", "https://ankurseeds.com/contact-us/", "Official website", "Ask for vegetable seed production or procurement team", "Indian domestic buyer/partner possibility", "Not contacted"],
  ["JK Agri Genetics", "India", "Seed company", "Vegetables and field crops", "Medium", "Production / business development", "Use official contact form", "Use official contact page", "https://www.jkseeds.com/", "https://www.jkseeds.com/contact-us/", "Official website", "Approach for production/sourcing discussion", "Indian target", "Not contacted"],
  ["Kalash Seeds", "India", "Vegetable seed company", "Tomato, chilli, capsicum, cucurbits, okra", "High", "Production / sourcing", "Use official contact form", "Use official contact page", "https://www.kalashseeds.com/", "https://www.kalashseeds.com/contact-us/", "Official website", "Very relevant Indian vegetable seed target", "Good fit for local production discussion", "Not contacted"],
  ["Ajeet Seeds", "India", "Seed company", "Vegetables and field crops", "Medium", "Production / procurement", "Use official contact form", "Use official contact page", "https://www.ajeetseed.co.in/", "https://www.ajeetseed.co.in/contact-us/", "Official website", "Ask for production/procurement team", "Indian target", "Not contacted"],
  ["Technisem / Novalliance", "France / Africa", "Vegetable seed company and distributor network", "Tropical vegetables, tomato, pepper, onion, okra", "High", "Procurement / sourcing / Africa supply", "Use official contact form", "Use official contact page", "https://www.technisem.com/", "https://www.technisem.com/contact/", "Official website", "Strong buyer for tropical vegetable seed supply", "Good fit for export-oriented India supply", "Not contacted"],
  ["Graines Voltz", "France / Europe", "Seed distributor", "Vegetable and flower seeds", "Medium", "Purchasing / sourcing", "Use official contact form", "Use official contact page", "https://www.grainesvoltz.com/", "https://www.grainesvoltz.com/contact", "Official website", "Approach as production/sourcing partner for selected crops", "Distributor buyer potential", "Not contacted"],
  ["CN Seeds", "United Kingdom", "Specialist vegetable seed supplier", "Herbs, babyleaf, vegetables", "Medium", "Purchasing / sourcing", "Use official contact form", "Use official contact page", "https://www.cnseeds.co.uk/", "https://www.cnseeds.co.uk/contact-us/", "Official website", "Approach for specialty vegetable seed sourcing", "May be niche, not all crops", "Not contacted"],
  ["Elsoms Seeds", "United Kingdom", "Seed company", "Vegetables and arable crops", "Medium", "Purchasing / sourcing", "Use official contact form", "Use official contact page", "https://www.elsoms.com/", "https://www.elsoms.com/contact/", "Official website", "Ask for vegetable seed sourcing/procurement", "UK target", "Not contacted"],
  ["Pop Vriend Seeds / KWS Vegetables", "Netherlands", "Spinach and vegetable seed company", "Spinach, beans, vegetables", "Medium", "Production / sourcing", "Use official contact form", "Use official contact page", "https://www.popvriendseeds.com/", "https://www.popvriendseeds.com/contact/", "Official website", "Approach for production/sourcing discussion", "Specific crop fit may vary", "Not contacted"],
  ["Agrimatco", "Middle East / Africa / Europe", "Agricultural distributor", "Seeds and agricultural inputs", "Medium", "Seed procurement / regional distribution", "Use official contact form", "Use country office contact", "https://www.agrimatco.com/", "https://www.agrimatco.com/contact-us/", "Official website", "Approach as Indian seed production/export partner", "Distributor network can become buyer channel", "Not contacted"],
  ["Southern Seed", "Thailand", "Vegetable seed company", "Tropical vegetable seeds", "Medium", "Production / sourcing", "Use official contact form", "Use official contact page", "https://www.southernseed.com/", "https://www.southernseed.com/contact-us/", "Official website", "Approach for tropical vegetable seed programs", "Regional buyer potential", "Not contacted"],
  ["Harris Moran / HM.CLAUSE USA", "USA", "Vegetable seed brand under HM.CLAUSE", "Tomato, pepper, melon, lettuce", "Medium", "Production / sourcing", "Use HM.CLAUSE contact", "Use regional contact page", "https://hmclause.com/", "https://hmclause.com/contact/", "Official website", "Route through HM.CLAUSE production/sourcing", "Duplicate group but different regional entry", "Not contacted"],
  ["Condor Seed Production", "USA / Chile / Global", "Seed production and multiplication service", "Vegetable and agronomic seed production services", "Medium", "Partnership / service benchmarking", "Use official contact form", "Use official contact page", "https://www.condorseed.com/", "https://www.condorseed.com/contact/", "Official website / seed multiplication research", "Could be partner/benchmark rather than buyer", "Useful for understanding service positioning", "Not contacted"]
];

const seedQuestLeads = [
  ["Mahyco Private Limited", "SeedQuest vegetable seed supplier listing", "India", "Tomato / pepper / vegetable seeds", "https://www.seedquest.com/suppliers.php?field=veg_inc&from=&id_article=282&orgtype=scompany&type=supplier", "Cross-check official contact before outreach"],
  ["Inventive Seeds Pvt. Ltd.", "SeedQuest vegetable seed supplier listing", "India", "Vegetable seeds including tomato/pepper categories", "https://www.seedquest.com/suppliers.php?field=veg_inc&from=&id_article=126964&orgtype=scompany&type=supplier", "Possible Karnataka-relevant target"],
  ["Genome Seeds", "SeedQuest vegetable seed supplier listing", "Jordan / India production stations", "Tomato and vegetable seeds", "https://www.seedquest.com/suppliers.php?field=veg_inc&from=&id_article=72329&orgtype=scompany&type=supplier", "Approach if official contact is verified"],
  ["Enza Zaden", "SeedQuest vegetable seed supplier category", "Netherlands", "Tomato, pepper, vegetable seeds", "https://www.seedquest.com/suppliers.php?by=&field=veg_inc&id_region=&id_taxo=959&item_val=&orgtype=scompany&type=supplier", "Use official contact page"],
  ["HM.CLAUSE", "SeedQuest vegetable seed supplier category", "France / USA", "Tomato, pepper, cucurbits", "https://www.seedquest.com/suppliers.php?by=&field=veg_inc&id_region=&id_taxo=959&item_val=&orgtype=scompany&type=supplier", "Use official contact page"],
  ["Sakata", "SeedQuest vegetable seed supplier category", "Japan / India / USA", "Tomato, pepper, brassicas, cucurbits", "https://www.seedquest.com/suppliers.php?field=veg_inc&orgtype=scompany&type=supplier", "Start with India office"],
  ["Takii", "SeedQuest vegetable seed supplier category", "Japan / USA", "Vegetable seeds", "https://www.seedquest.com/suppliers.php?field=veg_inc&orgtype=scompany&type=supplier", "Use official contact page"],
  ["Tozer Seeds", "SeedQuest vegetable seed supplier category", "United Kingdom / USA", "Vegetable seeds", "https://www.seedquest.com/suppliers.php?field=veg_inc&orgtype=scompany&type=supplier", "Use official sales contact"],
  ["Vilmorin-Mikado", "SeedQuest vegetable seed supplier category", "France / Japan", "Vegetable seeds", "https://www.seedquest.com/suppliers.php?field=veg_inc&orgtype=scompany&type=supplier", "Use official contact page"],
  ["Seed multiplication services directory", "SeedQuest service category", "Global", "Seed multiplication / contract production service providers", "https://www.seedquest.com/suppliers.php?orgtype=smulti&type=supplier", "Use as research source; verify each company on official website"]
];

const services = [
  ["Seed multiplication / contract seed production", "Potential partner or competitor benchmark", "Use to position Boosnur as contract production from India", "Search terms: contract seed production, seed multiplication services, vegetable seed production partner", "Focus on companies needing India production capacity"],
  ["Seed testing laboratories", "Support service for buyer confidence", "Can help offer germination/purity testing coordination", "Search terms: ISTA seed testing India, seed testing lab Karnataka", "Mention testing can be coordinated as required"],
  ["Seed processing equipment/service companies", "Operational partner", "Cleaning, grading, packing support", "Search terms: seed processing service India, seed cleaning grading vegetable seeds", "Useful after first buyer discussions"],
  ["Export documentation consultants", "Operational support", "IEC, phytosanitary, commercial invoice, packing list", "Search terms: seed export phytosanitary consultant India", "Needed before first commercial shipment"],
  ["Vegetable seed distributors", "Buyer channel", "They may buy seed lots for local/regional resale", "Search terms: vegetable seed distributor Africa Middle East Europe contact", "Good for smaller initial orders"]
];

const templateRows = [
  ["Subject", "Contract seed production support from Davangere, Karnataka, India"],
  ["Opening", "Dear [Name/Team],"],
  ["Intro", "Boosnur Genetics is a contract seed production and export startup based in Davangere, Karnataka, India."],
  ["Positioning", "We are building reliable grower-based production programs for vegetable seeds according to buyer requirements, with practical field oversight, transparent communication, and export coordination."],
  ["Crops", "We would be interested in discussing requirements for tomato, chilli/hot pepper, bell pepper, cucurbits, okra, or other buyer-specified vegetable seed programs."],
  ["Ask", "Could you please connect us with the right person handling external seed production, sourcing, or supplier development?"],
  ["Close", "Thank you. We would be glad to share our company profile and discuss a trial production program if there is a fit."],
  ["Signature", "Boosnur Genetics | Davangere, Karnataka, India | +91 88927 57959 | info@boosnurgenetics.com"]
];

const headers = ["Company", "Country / Region", "Buyer Type", "Relevant Crops / Fit", "Priority", "Best Department To Approach", "Email / Contact Method", "Phone", "Website", "Contact URL", "Source", "Suggested First Message", "Notes", "Outreach Status"];

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const targetSheet = workbook.worksheets.add("Buyer Targets");
const mailSheet = workbook.worksheets.add("Mail Merge");
const sqSheet = workbook.worksheets.add("SeedQuest Leads");
const serviceSheet = workbook.worksheets.add("Services Map");
const templateSheet = workbook.worksheets.add("Email Template");

function isDirectEmail(contact) {
  return contact.includes("@");
}

function cropFocus(crops) {
  const lower = crops.toLowerCase();
  if (lower.includes("tomato") || lower.includes("pepper") || lower.includes("chilli")) {
    return "tomato, chilli/hot pepper, bell pepper, and other buyer-specified vegetable seed programs";
  }
  if (lower.includes("cucurbit") || lower.includes("watermelon") || lower.includes("melon")) {
    return "cucurbits, watermelon, melon, and other buyer-specified vegetable seed programs";
  }
  if (lower.includes("distributor")) {
    return "vegetable seed sourcing and contract-grown seed lots from India";
  }
  return "vegetable seed programs according to your buyer specifications";
}

function outreachSubject(row) {
  const [company, , type, crops] = row;
  if (type.toLowerCase().includes("distributor")) {
    return `Vegetable seed sourcing support from Davangere, India - Boosnur Genetics`;
  }
  if (type.toLowerCase().includes("multiplication") || type.toLowerCase().includes("service")) {
    return `India seed production collaboration - Boosnur Genetics`;
  }
  if (crops.toLowerCase().includes("tomato") || crops.toLowerCase().includes("pepper")) {
    return `Contract tomato and pepper seed production from India - Boosnur Genetics`;
  }
  return `Contract vegetable seed production from Davangere, India - Boosnur Genetics`;
}

function outreachBody(row) {
  const [company, country, type, crops, priority, department, contact, phone, website, contactUrl, source, suggested, notes] = row;
  const focus = cropFocus(crops);
  const targetTeam = department.replace(" / ", ", ");
  const proofLine = priority === "High"
    ? "Your vegetable seed portfolio appears closely aligned with the type of contract production programs we are preparing to support."
    : "Your company appears relevant to our seed production and sourcing work, so I wanted to introduce Boosnur Genetics for the right internal team.";

  return [
    `Dear ${company} team,`,
    ``,
    `Greetings from Boosnur Genetics, Davangere, Karnataka, India.`,
    ``,
    `Boosnur Genetics is a contract seed production and export startup building reliable grower-based production programs for international seed companies, distributors, and sourcing teams. We focus on practical field oversight, transparent communication, and production planning according to buyer requirements.`,
    ``,
    proofLine,
    ``,
    `We would be interested in discussing requirements for ${focus}. Based on each buyer's requirement, we can discuss crop planning, grower selection, isolation needs, quality expectations, timeline, seed handling, packaging, export documentation, and shipment coordination.`,
    ``,
    `Could you please connect us with the person handling ${targetTeam.toLowerCase()}? We would be glad to share our company profile and discuss a small trial production or sourcing program if there is a fit.`,
    ``,
    `Best regards,`,
    `Boosnur Genetics`,
    `Davangere, Karnataka, India`,
    `Phone / WhatsApp: +91 88927 57959`,
    `Email: info@boosnurgenetics.com`
  ].join("\n");
}

const mailHeaders = ["Company", "Country / Region", "Send Method", "To / Contact", "Subject", "Personalized Message", "Priority", "Relevant Crops / Fit", "Contact URL", "Status"];
const mailRows = buyers.map((row) => {
  const [company, country, , crops, priority, , contact, , , contactUrl] = row;
  const method = isDirectEmail(contact) ? "Direct email" : "Contact form / website";
  const to = isDirectEmail(contact) ? contact : contactUrl;
  return [company, country, method, to, outreachSubject(row), outreachBody(row), priority, crops, contactUrl, "Ready to send"];
});

function styleTitle(sheet, range, title, subtitle) {
  sheet.getRange(range).merge();
  sheet.getRange(range).values = [[title]];
  sheet.getRange(range).format = {
    fill: "#173B30",
    font: { bold: true, color: "#FFFFFF", size: 18 },
    alignment: { horizontal: "left", vertical: "center" }
  };
  const nextRow = Number(range.match(/\d+/)[0]) + 1;
  sheet.getRange(`A${nextRow}:H${nextRow}`).merge();
  sheet.getRange(`A${nextRow}:H${nextRow}`).values = [[subtitle]];
  sheet.getRange(`A${nextRow}:H${nextRow}`).format = {
    fill: "#F4F0E6",
    font: { color: "#44534C", size: 11 },
    alignment: { horizontal: "left", vertical: "center" },
    wrapText: true
  };
}

styleTitle(summary, "A1:H1", "Boosnur Genetics - Seed Buyer Outreach Workbook", `Prepared ${today}. Restricted countries have been excluded as requested. Use this as a first-pass outreach list and verify contacts before sending commercial proposals.`);
summary.getRange("A4:B11").values = [
  ["Company location to mention", "Davangere, Karnataka, India"],
  ["Phone / WhatsApp", "+91 88927 57959"],
  ["Email", "info@boosnurgenetics.com"],
  ["Primary buyer focus", "Vegetable seed companies and distributors needing contract production or sourcing"],
  ["Best crops to lead with", "Tomato, chilli/hot pepper, bell pepper, cucurbits, okra, buyer-specified crops"],
  ["Best positioning", "Contract seed production and sourcing partner with practical field oversight"],
  ["Important caution", "Do not claim export history, acres, countries served, or certifications unless completed"],
  ["Recommended next action", "Contact 10 high-priority companies first, then follow up after 5-7 business days"]
];
summary.getRange("A4:A11").format = { fill: "#E8DDC7", font: { bold: true } };
summary.getRange("A4:B11").format.borders = { preset: "all", style: "thin", color: "#D8D0C2" };

targetSheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
targetSheet.getRangeByIndexes(1, 0, buyers.length, headers.length).values = buyers;

mailSheet.getRangeByIndexes(0, 0, 1, mailHeaders.length).values = [mailHeaders];
mailSheet.getRangeByIndexes(1, 0, mailRows.length, mailHeaders.length).values = mailRows;

sqSheet.getRange("A1:F1").values = [["Company / Category", "SeedQuest Context", "Country / Region", "Crop / Service Fit", "SeedQuest URL", "Action Note"]];
sqSheet.getRangeByIndexes(1, 0, seedQuestLeads.length, 6).values = seedQuestLeads;

serviceSheet.getRange("A1:E1").values = [["Service / Target Type", "Why It Matters", "How Boosnur Can Use It", "Search / Research Direction", "Outreach Note"]];
serviceSheet.getRangeByIndexes(1, 0, services.length, 5).values = services;

templateSheet.getRange("A1:B1").values = [["Email Part", "Suggested Text"]];
templateSheet.getRangeByIndexes(1, 0, templateRows.length, 2).values = templateRows;

for (const sheet of [targetSheet, mailSheet, sqSheet, serviceSheet, templateSheet]) {
  const used = sheet.getUsedRange();
  used.format.wrapText = true;
  used.format.borders = { preset: "all", style: "thin", color: "#D8D0C2" };
  sheet.getRangeByIndexes(0, 0, 1, used.columnCount).format = {
    fill: "#173B30",
    font: { bold: true, color: "#FFFFFF" },
    alignment: { horizontal: "center", vertical: "center" },
    wrapText: true
  };
  sheet.freezePanes.freezeRows(1);
}

targetSheet.tables.add(`A1:N${buyers.length + 1}`, true, "BuyerTargets");
mailSheet.tables.add(`A1:J${mailRows.length + 1}`, true, "MailMerge");
sqSheet.tables.add(`A1:F${seedQuestLeads.length + 1}`, true, "SeedQuestLeads");
serviceSheet.tables.add(`A1:E${services.length + 1}`, true, "ServicesMap");
templateSheet.tables.add(`A1:B${templateRows.length + 1}`, true, "EmailTemplate");

const widths = [210, 140, 190, 250, 90, 210, 190, 150, 210, 230, 210, 270, 260, 120];
widths.forEach((w, i) => {
  targetSheet.getRangeByIndexes(0, i, buyers.length + 1, 1).format.columnWidthPx = w;
});
[210, 140, 140, 230, 310, 760, 90, 260, 260, 120].forEach((w, i) => {
  mailSheet.getRangeByIndexes(0, i, mailRows.length + 1, 1).format.columnWidthPx = w;
});
[210, 190, 140, 220, 300, 260].forEach((w, i) => sqSheet.getRangeByIndexes(0, i, seedQuestLeads.length + 1, 1).format.columnWidthPx = w);
[210, 210, 260, 280, 260].forEach((w, i) => serviceSheet.getRangeByIndexes(0, i, services.length + 1, 1).format.columnWidthPx = w);
templateSheet.getRange("A:A").format.columnWidthPx = 150;
templateSheet.getRange("B:B").format.columnWidthPx = 760;
summary.getRange("A:A").format.columnWidthPx = 220;
summary.getRange("B:B").format.columnWidthPx = 720;

targetSheet.getRange(`E2:E${buyers.length + 1}`).conditionalFormats.add("containsText", { text: "High", format: { fill: "#DCEBE4", font: { bold: true, color: "#173B30" } } });
targetSheet.getRange(`N2:N${buyers.length + 1}`).dataValidation = { rule: { type: "list", values: ["Not contacted", "Email sent", "Follow-up needed", "Replied", "Not relevant"] } };
mailSheet.getRange(`G2:G${mailRows.length + 1}`).conditionalFormats.add("containsText", { text: "High", format: { fill: "#DCEBE4", font: { bold: true, color: "#173B30" } } });
mailSheet.getRange(`J2:J${mailRows.length + 1}`).dataValidation = { rule: { type: "list", values: ["Ready to send", "Sent", "Follow-up needed", "Replied", "Not relevant"] } };

const renderSheets = ["Summary", "Buyer Targets", "Mail Merge", "Email Template"];
for (const sheetName of renderSheets) {
  await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 20 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = [mailHeaders, ...mailRows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
await fs.writeFile(`${outputDir}/boosnur_genetics_mail_merge.csv`, csv, "utf8");
console.log(outputPath);
