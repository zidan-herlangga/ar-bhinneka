import random
import re
from fastapi import APIRouter, HTTPException

from ..data.provinces import PROVINCES
from ..data.cultures import CULTURES

router = APIRouter()

CATEGORIES = ["house", "clothing", "dance", "instrument", "food", "art"]

# Frasa untuk kalimat soal (tanpa kata "khas" agar tidak berulang).
CATEGORY_PHRASES = {
    "house": "rumah adat",
    "clothing": "pakaian adat",
    "dance": "tarian",
    "instrument": "alat musik",
    "food": "makanan",
    "art": "seni dan kerajinan",
}

REGION_LABELS = {
    "Sumatra": "Sumatra",
    "Java": "Jawa",
    "Kalimantan": "Kalimantan",
    "Sulawesi": "Sulawesi",
    "BaliNusaTenggara": "Bali & Nusa Tenggara",
    "Maluku": "Maluku",
    "Papua": "Papua",
}

# Kata umum yang tidak cukup spesifik untuk menilai jawaban isian singkat.
STOPWORDS = {
    "tari", "rumah", "adat", "khas", "pakaian", "baju", "kain", "tenun",
    "ukiran", "anyaman", "alat", "musik", "tradisional", "indonesia",
    "provinsi", "dan", "yang", "dari", "di", "ke", "pulau", "khas",
}


def _keywords(text: str, exclude: set[str] | None = None) -> list[str]:
    """Kata kunci untuk menilai jawaban isian singkat secara ramah anak."""
    exclude = exclude or set()
    cleaned = re.sub(r"[^a-z0-9\s]", " ", text.lower())
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    words = [w for w in cleaned.split(" ") if w]
    keys: list[str] = []
    for word in words:
        if (
            len(word) >= 3
            and word not in STOPWORDS
            and word not in exclude
            and word not in keys
        ):
            keys.append(word)
    if not keys:
        # Nama yang seluruhnya memuat nama provinsi: cocokkan frasa lengkap.
        if cleaned:
            keys.append(cleaned)
    elif cleaned not in keys:
        keys.insert(0, cleaned)
    return keys


def _unique_names(items: list[dict]) -> list[str]:
    names: list[str] = []
    for item in items:
        if item["name"] not in names:
            names.append(item["name"])
    return names


@router.get("/quiz")
async def get_quiz(province_id: str):
    province = next((p for p in PROVINCES if p["id"] == province_id), None)
    if not province:
        raise HTTPException(status_code=404, detail="Provinsi tidak ditemukan")

    items = [c for c in CULTURES if c["province_id"] == province_id]
    if not items:
        raise HTTPException(status_code=404, detail="Data budaya tidak tersedia")

    rng = random.Random(province_id)
    by_cat = {c["category"]: c for c in items}
    pname = province["name"]
    province_tokens = set(re.findall(r"[a-z0-9]+", pname.lower()))
    region_label = REGION_LABELS.get(province["region"], province["region"])

    def others_in(category: str) -> list[dict]:
        return [
            c for c in CULTURES
            if c["category"] == category and c["province_id"] != province_id
        ]

    multiple_choice: list[dict] = []
    yes_no: list[dict] = []
    essay: list[dict] = []

    # ---------- Pilihan ganda ----------
    for cat in CATEGORIES:
        item = by_cat.get(cat)
        if not item:
            continue
        phrase = CATEGORY_PHRASES[cat]
        candidate_names = [
            name for name in _unique_names(others_in(cat)) if name != item["name"]
        ]
        distractors = rng.sample(candidate_names, min(3, len(candidate_names)))
        options = [item["name"], *distractors]
        rng.shuffle(options)
        multiple_choice.append({
            "id": f"{province_id}-mc-{cat}",
            "type": "multiple_choice",
            "category": cat,
            "question": f"Apa {phrase} khas {pname}?",
            "options": options,
            "answer": item["name"],
            "explanation": f"{item['name']}: {item['description']}",
        })

    # Ibu kota
    other_capitals = [p["capital"] for p in PROVINCES if p["id"] != province_id]
    capital_options = [province["capital"], *rng.sample(other_capitals, 3)]
    rng.shuffle(capital_options)
    multiple_choice.append({
        "id": f"{province_id}-mc-capital",
        "type": "multiple_choice",
        "category": "province",
        "question": f"Apa ibu kota Provinsi {pname}?",
        "options": capital_options,
        "answer": province["capital"],
        "explanation": f"Ibu kota Provinsi {pname} adalah {province['capital']}.",
    })

    # Wilayah / pulau
    all_regions = list(dict.fromkeys(REGION_LABELS.values()))
    other_regions = [r for r in all_regions if r != region_label]
    region_options = [region_label, *rng.sample(other_regions, min(3, len(other_regions)))]
    rng.shuffle(region_options)
    multiple_choice.append({
        "id": f"{province_id}-mc-region",
        "type": "multiple_choice",
        "category": "province",
        "question": f"Provinsi {pname} terletak di wilayah ...",
        "options": region_options,
        "answer": region_label,
        "explanation": f"Provinsi {pname} berada di wilayah {region_label}.",
    })

    # Ciri khas salah satu budaya
    desc_cat = "house" if "house" in by_cat else CATEGORIES[0]
    desc_item = by_cat[desc_cat]
    desc_distractors = rng.sample(
        [c["description"] for c in others_in(desc_cat) if c["description"] != desc_item["description"]],
        3,
    )
    desc_options = [desc_item["description"], *desc_distractors]
    rng.shuffle(desc_options)
    multiple_choice.append({
        "id": f"{province_id}-mc-description",
        "type": "multiple_choice",
        "category": desc_cat,
        "question": f"Apa ciri khas {desc_item['name']}?",
        "options": desc_options,
        "answer": desc_item["description"],
        "explanation": f"{desc_item['name']} adalah {CATEGORY_PHRASES[desc_cat]} khas {pname}.",
    })

    # ---------- Ya / Tidak ----------
    for i, cat in enumerate(CATEGORIES):
        item = by_cat.get(cat)
        if not item:
            continue
        phrase = CATEGORY_PHRASES[cat]
        if i % 2 == 0:
            statement = f"{item['name']} adalah {phrase} khas {pname}."
            answer = "Ya"
            explanation = f"Benar. {item['name']} adalah {phrase} khas {pname}."
        else:
            candidates = [c for c in others_in(cat) if c["name"] != item["name"]]
            other = rng.choice(candidates)
            statement = f"{other['name']} adalah {phrase} khas {pname}."
            answer = "Tidak"
            explanation = (
                f"Tidak. {other['name']} bukan {phrase} khas {pname}. "
                f"Yang khas {pname} adalah {item['name']}."
            )
        yes_no.append({
            "id": f"{province_id}-yn-{cat}",
            "type": "yes_no",
            "category": cat,
            "question": statement,
            "options": ["Ya", "Tidak"],
            "answer": answer,
            "explanation": explanation,
        })

    # Ibu kota (Ya/Tidak)
    if rng.random() < 0.5:
        yn_capital = province["capital"]
        yn_capital_answer = "Ya"
        yn_capital_explanation = f"Benar. Ibu kota Provinsi {pname} adalah {province['capital']}."
    else:
        other_province = rng.choice([p for p in PROVINCES if p["id"] != province_id])
        yn_capital = other_province["capital"]
        yn_capital_answer = "Tidak"
        yn_capital_explanation = (
            f"Tidak. Ibu kota Provinsi {pname} adalah {province['capital']}, "
            f"bukan {yn_capital}."
        )
    yes_no.append({
        "id": f"{province_id}-yn-capital",
        "type": "yes_no",
        "category": "province",
        "question": f"Ibu kota Provinsi {pname} adalah {yn_capital}.",
        "options": ["Ya", "Tidak"],
        "answer": yn_capital_answer,
        "explanation": yn_capital_explanation,
    })

    # Wilayah (Ya/Tidak)
    if rng.random() < 0.5:
        yn_region = region_label
        yn_region_answer = "Ya"
        yn_region_explanation = f"Benar. Provinsi {pname} berada di wilayah {region_label}."
    else:
        yn_region = rng.choice(other_regions)
        yn_region_answer = "Tidak"
        yn_region_explanation = (
            f"Tidak. Provinsi {pname} berada di wilayah {region_label}, bukan {yn_region}."
        )
    yes_no.append({
        "id": f"{province_id}-yn-region",
        "type": "yes_no",
        "category": "province",
        "question": f"Provinsi {pname} terletak di wilayah {yn_region}.",
        "options": ["Ya", "Tidak"],
        "answer": yn_region_answer,
        "explanation": yn_region_explanation,
    })

    # Kategori budaya (Ya/Tidak)
    category_item = by_cat.get("dance") or items[0]
    wrong_cat = rng.choice([c for c in CATEGORIES if c != category_item["category"]])
    yes_no.append({
        "id": f"{province_id}-yn-category",
        "type": "yes_no",
        "category": category_item["category"],
        "question": (
            f"Apakah {category_item['name']} termasuk "
            f"{CATEGORY_PHRASES[wrong_cat]} khas {pname}?"
        ),
        "options": ["Ya", "Tidak"],
        "answer": "Tidak",
        "explanation": (
            f"Tidak. {category_item['name']} adalah "
            f"{CATEGORY_PHRASES[category_item['category']]} khas {pname}."
        ),
    })

    # ---------- Isian singkat ----------
    for cat in CATEGORIES:
        item = by_cat.get(cat)
        if not item:
            continue
        phrase = CATEGORY_PHRASES[cat]
        essay.append({
            "id": f"{province_id}-essay-{cat}",
            "type": "essay",
            "category": cat,
            "question": f"Sebutkan nama {phrase} khas {pname}.",
            "keywords": _keywords(item["name"], province_tokens),
            "sample_answer": item["name"],
            "explanation": item["description"],
        })

    essay.append({
        "id": f"{province_id}-essay-capital",
        "type": "essay",
        "category": "province",
        "question": f"Sebutkan ibu kota Provinsi {pname}.",
        "keywords": _keywords(province["capital"], province_tokens),
        "sample_answer": province["capital"],
        "explanation": f"Ibu kota Provinsi {pname} adalah {province['capital']}.",
    })

    art_names = [
        by_cat[cat]["name"] for cat in ("dance", "instrument") if cat in by_cat
    ]
    art_keywords: list[str] = []
    for name in art_names:
        for key in _keywords(name, province_tokens):
            if key not in art_keywords:
                art_keywords.append(key)
    essay.append({
        "id": f"{province_id}-essay-dance-instrument",
        "type": "essay",
        "category": "art",
        "question": f"Sebutkan satu tarian atau alat musik khas {pname}.",
        "keywords": art_keywords,
        "sample_answer": " atau ".join(art_names),
        "explanation": f"Contoh jawaban: {', '.join(art_names)}.",
    })

    # ---------- Campur urutan agar tidak monoton ----------
    for pool in (multiple_choice, yes_no, essay):
        rng.shuffle(pool)

    pattern = ["multiple_choice", "multiple_choice", "yes_no", "essay"]
    pools = {
        "multiple_choice": multiple_choice,
        "yes_no": yes_no,
        "essay": essay,
    }
    questions: list[dict] = []
    while any(pools.values()):
        for qtype in pattern:
            if pools[qtype]:
                questions.append(pools[qtype].pop(0))

    return {
        "province_id": province_id,
        "province_name": pname,
        "region": region_label,
        "total": len(questions),
        "summary": {
            "multiple_choice": sum(1 for q in questions if q["type"] == "multiple_choice"),
            "yes_no": sum(1 for q in questions if q["type"] == "yes_no"),
            "essay": sum(1 for q in questions if q["type"] == "essay"),
        },
        "questions": questions,
    }
