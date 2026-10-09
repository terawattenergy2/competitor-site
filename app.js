const companies = [
  {
    name: "Brighten Generation",
    url: "https://www.facebook.com/BrightenGeneration",
  },
  {
    name: "Titan Green Energy",
    url: "https://www.facebook.com/TITANGreenEnergy",
  },
  {
    name: "Sigenergy x Tradesol",
    url: "https://www.facebook.com/profile.php?id=61582534865799",
  },
  {
    name: "Terawatt Energy",
    url: "https://www.facebook.com/profile.php?id=61572527980733",
  },
];
function classify(t) {
  if (t === "เปลี่ยนรูปภาพหน้าปก") return "เปลี่ยนรูปปก";
  if (
    /ข้อความไม่ปรากฏ|เนื้อหาที่แชร์ไม่สามารถ|ระบุสถานที่|COMING SOON|^แชร์: ปรบมือ/.test(
      t,
    )
  )
    return "รอตรวจเนื้อหาเต็ม";
  if (/น้ำท่วม|ความปลอดภัย|IP66|ปกป้อง/.test(t))
    return "ให้ความรู้ / ความปลอดภัย";
  if (/Training|เทรนนิ่ง|อบรม|Workshop|Webinar|สัมมนา|อัปสกิล|Train/i.test(t))
    return "กิจกรรม / อบรม";
  if (/รีวิว|ใช้งานจริงในบ้าน|เสียงจริง|CYC|ค่าไฟเหลือ|Project/.test(t))
    return "รีวิว / กรณีศึกษา";
  if (
    /โปรโมชัน|พร้อมส่ง|เลือกซื้อ|ตัวแทนจำหน่าย|Distributor|รับประกัน|คุยทีเดียว|คุ้มระยะยาว/.test(
      t,
    )
  )
    return "ขาย / บริการ";
  if (
    /Golf|กอล์ฟ|ยินดี|ขอบคุณ|พาร์ทเนอร์|Partner|ร่วมงาน|บรรยากาศ|เปิดตัว|ข่าวอันดับ|Tier|วันแม่|วันหยุด|วันเฉลิม|วันอาสาฬ|ออฟฟิศ|ภาคภูมิใจ|Award|Congratulations|เยี่ยมชม|สิริมงคล|Partnership/.test(
      t,
    )
  )
    return "แบรนด์ / กิจกรรม";
  return "ให้ความรู้ / สินค้า";
}
const data = window.auditRows.map((r) => ({
  company: r[0],
  time: r[1],
  title: r[2],
  media: r[3],
  reactions: r[4],
  comments: r[5],
  shares: r[6],
  url: "https://www.facebook.com/" + r[7],
  category: classify(r[2]),
  cover: r[2] === "เปลี่ยนรูปภาพหน้าปก",
}));
const el = (id) => document.getElementById(id);
const fmt = (v) => (v === null ? "ไม่ทราบ" : String(v));
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

let page = 0;
const size = 20;
const score = (r) =>
  typeof r.reactions === "number"
    ? r.reactions
    : parseFloat(r.reactions || "0") *
      (String(r.reactions).includes("พัน") ? 1000 : 1);
companies.forEach((c, i) => {
  el("company").add(new Option(c.name, String(i)));
  const n = data.filter((r) => r.company === i).length;
  el("companies").insertAdjacentHTML(
    "beforeend",
    `<button class="company" data-company="${i}" style="--company:var(--b${i})"><div class="label">${esc(c.name)}${i === 3 ? '<span class="tag">บริษัทคุณ</span>' : ""}</div><strong>${n}<span>โพสต์ที่ตรวจพบ</span></strong><small>${i === 3 ? "รวมเปลี่ยนรูปปก 2 รายการ" : "จากหน้าเพจในช่วงที่ตรวจ"}</small></button>`,
  );
});
const categories = [...new Set(data.map((r) => r.category))];
categories.forEach((c) => el("category").add(new Option(c, c)));
function filtered() {
  return data.filter(
    (r) =>
      (el("company").value === "all" ||
        r.company === Number(el("company").value)) &&
      (el("media").value === "all" || r.media === el("media").value) &&
      (el("category").value === "all" || r.category === el("category").value) &&
      (el("kind").value === "all" ||
        (el("kind").value === "cover" ? r.cover : !r.cover)),
  );
}
function bar(label, n, max, color) {
  return `<div class="chart-row"><span class="row-label">${esc(label)}</span><div class="bar-track"><div class="company-bar" style="width:${(n / Math.max(max, 1)) * 100}%;background:${color}"></div></div><strong>${n}</strong></div>`;
}
function render() {
  let rows = filtered();
  el("scope").textContent =
    `กำลังแสดง ${rows.length} จาก 171 โพสต์ที่ตรวจพบ · กราฟและตารางใช้ตัวกรองเดียวกัน`;
  document.querySelectorAll("[data-company]").forEach((b) => {
    const active = b.dataset.company === el("company").value;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  const counts = companies.map(
    (c, i) => rows.filter((r) => r.company === i).length,
  );
  const max = Math.max(...counts, 1);
  el("counts").innerHTML = companies
    .map((c, i) => bar(c.name, counts[i], max, `var(--b${i})`))
    .join("");
  el("mediaChart").innerHTML = companies
    .map((c, i) => {
      const group = rows.filter((r) => r.company === i);
      return `<div class="chart-row"><span class="row-label">${esc(c.name)}</span><div class="bar-track">${[
        "รูปภาพ",
        "วิดีโอ",
        "ยังไม่ยืนยัน",
      ]
        .map((m, j) => {
          const n = group.filter((r) => r.media === m).length;
          return `<span class="segment ${["photo", "video", "unknown"][j]}" style="width:${(n / max) * 100}%" title="${esc(m)}: ${n}">${n || ""}</span>`;
        })
        .join("")}</div><strong>${group.length}</strong></div>`;
    })
    .join("");
  const cats = categories
    .map((c) => [c, rows.filter((r) => r.category === c).length])
    .filter((x) => x[1])
    .sort((a, b) => b[1] - a[1]);
  el("categories").innerHTML = cats.length
    ? cats
        .map(([c, n]) =>
          bar(c, n, Math.max(...cats.map((x) => x[1])), "#3575e0"),
        )
        .join("")
    : '<p class="empty">ไม่มีโพสต์ตรงกับตัวกรอง</p>';
  const top = rows
    .filter((r) => r.reactions !== null)
    .slice()
    .sort((a, b) => score(b) - score(a))
    .slice(0, 5);
  el("top").innerHTML = top.length
    ? top
        .map(
          (r) =>
            `<div style="margin-bottom:16px"><a class="top-title" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a><div class="top-meta">${esc(companies[r.company].name)} · ${esc(r.time)} · ${esc(fmt(r.reactions))} ปฏิกิริยา</div><div class="bar-track"><div class="company-bar ${typeof r.reactions === "string" ? "approx" : ""}" style="width:${(score(r) / Math.max(score(top[0]), 1)) * 100}%;background-color:var(--b${r.company})"></div></div></div>`,
        )
        .join("")
    : '<p class="empty">ไม่มีตัวเลขปฏิกิริยาที่อ่านได้</p>';
  if (el("sort").value === "reactions")
    rows = rows.slice().sort((a, b) => score(b) - score(a));
  page = Math.min(page, Math.max(Math.ceil(rows.length / size) - 1, 0));
  el("rows").innerHTML =
    rows
      .slice(page * size, (page + 1) * size)
      .map(
        (r) =>
          `<tr><td><div class="company-name"><i class="dot" style="background:var(--b${r.company})"></i>${esc(companies[r.company].name)}</div><a class="post-title" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ↗</a><div class="post-time">${esc(r.time)}</div></td><td><span class="badge">${esc(r.media)}</span><div class="category">${esc(r.category)}</div></td>${[r.reactions, r.comments, r.shares].map((v) => `<td class="metric ${v === null ? "unknown" : ""}">${esc(fmt(v))}</td>`).join("")}</tr>`,
      )
      .join("") ||
    '<tr><td colspan="5" class="empty">ไม่มีโพสต์ตรงกับตัวกรอง</td></tr>';
  el("pageInfo").textContent = rows.length
    ? `${page * size + 1}–${Math.min((page + 1) * size, rows.length)} จาก ${rows.length} โพสต์`
    : "0 โพสต์";
  el("prev").disabled = page === 0;
  el("next").disabled = (page + 1) * size >= rows.length;
}
["company", "media", "category", "kind", "sort"].forEach((id) =>
  el(id).addEventListener("change", () => {
    page = 0;
    render();
  }),
);
document.querySelectorAll("[data-company]").forEach((b) =>
  b.addEventListener("click", () => {
    el("company").value =
      el("company").value === b.dataset.company ? "all" : b.dataset.company;
    page = 0;
    render();
  }),
);
el("reset").addEventListener("click", () => {
  ["company", "media", "category", "kind"].forEach(
    (id) => (el(id).value = "all"),
  );
  el("sort").value = "original";
  page = 0;
  render();
});
el("prev").addEventListener("click", () => {
  page--;
  render();
});
el("next").addEventListener("click", () => {
  page++;
  render();
});
render();
if (navigator.modelContext?.registerTool) {
  navigator.modelContext.registerTool({
    name: "read_filtered_posts",
    description:
      "Read observed Facebook posts under the current filters. Data is incomplete and reactions are not reach.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({ incomplete: true, posts: filtered() }),
        },
      ],
    }),
  });
}
