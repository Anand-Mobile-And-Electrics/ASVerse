"use client";

import { useMemo, useState } from "react";

type ExtraToolRendererProps = {
  slug: string;
};

function Result({ value }: { value: string }) {
  return <pre className="mt-3 overflow-auto rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-900">{value || "Result will appear here..."}</pre>;
}

function NumberInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />;
}

function EmiCalculatorTool() {
  const [principal, setPrincipal] = useState("500000");
  const [annualRate, setAnnualRate] = useState("10");
  const [months, setMonths] = useState("60");

  const output = useMemo(() => {
    const p = Number(principal);
    const r = Number(annualRate) / 12 / 100;
    const n = Number(months);
    if (!p || !n || r < 0) return "Enter valid values";
    const emi = r === 0 ? p / n : (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    const total = emi * n;
    return `Monthly EMI: ${emi.toFixed(2)}\nTotal Payment: ${total.toFixed(2)}\nTotal Interest: ${(total - p).toFixed(2)}`;
  }, [principal, annualRate, months]);

  return (
    <div className="space-y-2">
      <NumberInput value={principal} onChange={setPrincipal} placeholder="Principal" />
      <NumberInput value={annualRate} onChange={setAnnualRate} placeholder="Annual rate %" />
      <NumberInput value={months} onChange={setMonths} placeholder="Loan months" />
      <Result value={output} />
    </div>
  );
}

function SimpleInterestTool() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("2");
  const output = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate);
    const t = Number(years);
    const si = (p * r * t) / 100;
    return `Simple Interest: ${si.toFixed(2)}\nTotal Amount: ${(p + si).toFixed(2)}`;
  }, [principal, rate, years]);
  return <Result value={output} />;
}

function CompoundInterestTool() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("5");
  const [times, setTimes] = useState("4");

  const output = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(years);
    const n = Number(times);
    const amount = p * (1 + r / n) ** (n * t);
    return `Final Amount: ${amount.toFixed(2)}\nCompound Interest: ${(amount - p).toFixed(2)}`;
  }, [principal, rate, years, times]);

  return (
    <div className="space-y-2">
      <NumberInput value={principal} onChange={setPrincipal} placeholder="Principal" />
      <NumberInput value={rate} onChange={setRate} placeholder="Rate %" />
      <NumberInput value={years} onChange={setYears} placeholder="Years" />
      <NumberInput value={times} onChange={setTimes} placeholder="Compounds/year" />
      <Result value={output} />
    </div>
  );
}

function GstCalculatorTool() {
  const [amount, setAmount] = useState("1000");
  const [gst, setGst] = useState("18");
  const output = useMemo(() => {
    const a = Number(amount);
    const g = Number(gst);
    const add = a + (a * g) / 100;
    const remove = (a * 100) / (100 + g);
    return `With GST: ${add.toFixed(2)}\nBase amount from inclusive price: ${remove.toFixed(2)}`;
  }, [amount, gst]);
  return <Result value={output} />;
}

function DiscountCalculatorTool() {
  const [price, setPrice] = useState("2500");
  const [discount, setDiscount] = useState("20");
  const output = useMemo(() => {
    const p = Number(price);
    const d = Number(discount);
    const save = (p * d) / 100;
    const final = p - save;
    return `You Save: ${save.toFixed(2)}\nFinal Price: ${final.toFixed(2)}`;
  }, [price, discount]);
  return <Result value={output} />;
}

function TipCalculatorTool() {
  const [bill, setBill] = useState("1200");
  const [tip, setTip] = useState("10");
  const [people, setPeople] = useState("3");
  const output = useMemo(() => {
    const b = Number(bill);
    const t = Number(tip);
    const p = Math.max(1, Number(people));
    const total = b + (b * t) / 100;
    return `Tip Amount: ${(total - b).toFixed(2)}\nTotal Bill: ${total.toFixed(2)}\nPer Person: ${(total / p).toFixed(2)}`;
  }, [bill, tip, people]);
  return <Result value={output} />;
}

function UnitConverterTool({
  units,
  baseFactors,
}: {
  units: string[];
  baseFactors: Record<string, number>;
}) {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1] ?? units[0]);

  const output = useMemo(() => {
    const input = Number(value);
    if (Number.isNaN(input)) return "Enter a valid number";
    const inBase = input * baseFactors[from];
    const converted = inBase / baseFactors[to];
    return `${value} ${from} = ${converted.toFixed(6)} ${to}`;
  }, [value, from, to, baseFactors]);

  return (
    <div className="space-y-2">
      <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />
      <div className="flex gap-2">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900">
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900">
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <Result value={output} />
    </div>
  );
}

function TemperatureConverterTool() {
  const [value, setValue] = useState("0");
  const [from, setFrom] = useState("C");
  const [to, setTo] = useState("F");

  const output = useMemo(() => {
    const v = Number(value);
    if (Number.isNaN(v)) return "Enter a valid number";

    const toC = (x: number, unit: string) => {
      if (unit === "C") return x;
      if (unit === "F") return ((x - 32) * 5) / 9;
      return x - 273.15;
    };

    const fromC = (x: number, unit: string) => {
      if (unit === "C") return x;
      if (unit === "F") return (x * 9) / 5 + 32;
      return x + 273.15;
    };

    const result = fromC(toC(v, from), to);
    return `${value}°${from} = ${result.toFixed(4)}°${to}`;
  }, [value, from, to]);

  return (
    <div className="space-y-2">
      <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />
      <div className="flex gap-2">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900">
          <option value="C">C</option>
          <option value="F">F</option>
          <option value="K">K</option>
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900">
          <option value="C">C</option>
          <option value="F">F</option>
          <option value="K">K</option>
        </select>
      </div>
      <Result value={output} />
    </div>
  );
}

function SlugGeneratorTool() {
  const [text, setText] = useState("How to Build SEO Tools Fast");
  const slug = useMemo(
    () =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    [text],
  );
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />
      <Result value={slug} />
    </div>
  );
}

function MetaTagGeneratorTool() {
  const [title, setTitle] = useState("My Page Title");
  const [description, setDescription] = useState("A useful page description for search and social sharing.");
  const [url, setUrl] = useState("https://example.com/page");
  const [image, setImage] = useState("https://example.com/og.jpg");

  const result = useMemo(
    () =>
      `<title>${title}</title>\n<meta name="description" content="${description}" />\n<link rel="canonical" href="${url}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta property="og:url" content="${url}" />\n<meta property="og:image" content="${image}" />\n<meta name="twitter:card" content="summary_large_image" />`,
    [title, description, url, image],
  );

  return (
    <div className="space-y-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Title" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20 w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Description" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Canonical URL" />
      <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="OG Image URL" />
      <Result value={result} />
    </div>
  );
}

function KeywordDensityTool() {
  const [text, setText] = useState("SEO content should be useful, readable, and structured for users.");
  const [keyword, setKeyword] = useState("seo");
  const result = useMemo(() => {
    const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    const total = words.length || 1;
    const count = words.filter((w) => w === keyword.toLowerCase().trim()).length;
    const density = (count / total) * 100;
    return `Total words: ${total}\nKeyword count: ${count}\nDensity: ${density.toFixed(2)}%`;
  }, [text, keyword]);

  return (
    <div className="space-y-2">
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Keyword" />
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Paste article text" />
      <Result value={result} />
    </div>
  );
}

function UtmBuilderTool() {
  const [url, setUrl] = useState("https://example.com");
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("organic");
  const [campaign, setCampaign] = useState("launch");

  const result = useMemo(() => {
    try {
      const u = new URL(url);
      u.searchParams.set("utm_source", source);
      u.searchParams.set("utm_medium", medium);
      u.searchParams.set("utm_campaign", campaign);
      return u.toString();
    } catch {
      return "Enter a valid URL";
    }
  }, [url, source, medium, campaign]);

  return (
    <div className="space-y-2">
      <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" />
      <div className="grid gap-2 sm:grid-cols-3">
        <input value={source} onChange={(e) => setSource(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="utm_source" />
        <input value={medium} onChange={(e) => setMedium(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="utm_medium" />
        <input value={campaign} onChange={(e) => setCampaign(e.target.value)} className="rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="utm_campaign" />
      </div>
      <Result value={result} />
    </div>
  );
}

function RobotsGeneratorTool() {
  const [allow, setAllow] = useState("/");
  const [disallow, setDisallow] = useState("/admin");
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const result = `User-agent: *\nAllow: ${allow}\nDisallow: ${disallow}\n\nSitemap: ${sitemap}`;

  return (
    <div className="space-y-2">
      <input value={allow} onChange={(e) => setAllow(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Allow path" />
      <input value={disallow} onChange={(e) => setDisallow(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Disallow path" />
      <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Sitemap URL" />
      <Result value={result} />
    </div>
  );
}

function FaqSchemaGeneratorTool() {
  const [raw, setRaw] = useState("What is ASVerse?|ASVerse is a free tools platform.\nIs it free?|Yes, fully free.");
  const result = useMemo(() => {
    const items = raw
      .split("\n")
      .map((line) => line.split("|").map((x) => x.trim()))
      .filter((arr) => arr.length >= 2 && arr[0] && arr[1]);

    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      null,
      2,
    );
  }, [raw]);

  return (
    <div className="space-y-2">
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Question|Answer (one per line)" />
      <Result value={result} />
    </div>
  );
}

export function ExtraToolRenderer({ slug }: ExtraToolRendererProps) {
  switch (slug) {
    case "emi-calculator":
      return <EmiCalculatorTool />;
    case "simple-interest-calculator":
      return <SimpleInterestTool />;
    case "compound-interest-calculator":
      return <CompoundInterestTool />;
    case "gst-calculator":
      return <GstCalculatorTool />;
    case "discount-calculator":
      return <DiscountCalculatorTool />;
    case "tip-calculator":
      return <TipCalculatorTool />;

    case "length-converter":
      return (
        <UnitConverterTool
          units={["m", "km", "cm", "mm", "in", "ft", "yd", "mi"]}
          baseFactors={{ m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 }}
        />
      );
    case "weight-converter":
      return (
        <UnitConverterTool
          units={["kg", "g", "mg", "lb", "oz"]}
          baseFactors={{ kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.0283495231 }}
        />
      );
    case "temperature-converter":
      return <TemperatureConverterTool />;
    case "data-storage-converter":
      return (
        <UnitConverterTool
          units={["B", "KB", "MB", "GB", "TB"]}
          baseFactors={{ B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }}
        />
      );
    case "speed-converter":
      return (
        <UnitConverterTool
          units={["m/s", "km/h", "mph", "knot"]}
          baseFactors={{ "m/s": 1, "km/h": 0.2777777778, mph: 0.44704, knot: 0.514444 }}
        />
      );
    case "area-converter":
      return (
        <UnitConverterTool
          units={["sqm", "sqft", "acre", "hectare", "sqkm"]}
          baseFactors={{ sqm: 1, sqft: 0.09290304, acre: 4046.8564224, hectare: 10000, sqkm: 1_000_000 }}
        />
      );

    case "meta-tag-generator":
      return <MetaTagGeneratorTool />;
    case "slug-generator":
      return <SlugGeneratorTool />;
    case "keyword-density-checker":
      return <KeywordDensityTool />;
    case "utm-builder":
      return <UtmBuilderTool />;
    case "robots-txt-generator":
      return <RobotsGeneratorTool />;
    case "faq-schema-generator":
      return <FaqSchemaGeneratorTool />;

    default:
      return <p className="text-sm text-slate-600 dark:text-slate-300">Tool UI not found.</p>;
  }
}
