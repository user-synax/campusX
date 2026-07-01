// Leetspeak character mapping for common substitutions
const leetMap = {
    a: ["4", "@", "∆", "∂", "α"],
    b: ["8", "13", "|3", "ß", "Β"],
    c: ["(", "[", "{", "<", "©", "ç"],
    d: ["|)", "])", "∂", "ð", "đ"],
    e: ["3", "€", "£", "è", "é", "ê", "ë", "∑"],
    f: ["|=", "ƒ", "Ƒ"],
    g: ["6", "9", "(&", "ĝ", "ğ"],
    h: ["#", "|-|", "]-[", "}{", "Ħ", "ħ"],
    i: ["1", "!", "|", "¡", "ı", "Î"],
    j: ["_/", "ʝ", "ĵ", "ʄ"],
    k: ["|<", "|{", "X", "κ", "Κ"],
    l: ["1", "|_", "£", "ł"],
    m: ["|v|", "|\\/|", "/\\/\\", "м", "Μ"],
    n: ["|\\|", "/\\/", "η", "Ν"],
    o: ["0", "()", "[]", "{}", "ø", "Ω"],
    p: ["|>", "9", "Þ", "þ", "ρ"],
    q: ["0_", "0,", "Q", "κ"],
    r: ["|2", "®", "®", "ř", "ŕ"],
    s: ["5", "$", "§", "ś", "ş"],
    t: ["7", "+", "†", "τ", "ţ"],
    u: ["|_|", "µ", "ú", "û"],
    v: ["\\/"],
    w: ["\\/\\/", "vv", "ω", "Ω"],
    x: ["%", "><", "×", "χ"],
    y: ["y", "ý", "ÿ"],
    z: ["2", "z", "ž", "Ž"],
};

const blockedTerms = {
    sexual: [
        "porn",
        "sex",
        "sexy",
        "nude",
        "naked",
        "booty",
        "ass",
        "dick",
        "cock",
        "pussy",
        "fuck",
        "fucking",
        "blowjob",
        "handjob",
        "anal",
        "vagina",
        "penis",
        "masturbate",
        "masturbating",
        "horny",
        "hentai",
        "cum",
        "jizz",
        "sperm",
    ],
    violence: [
        "kill",
        "killing",
        "murder",
        "murdering",
        "shoot",
        "shooting",
        "gun",
        "bomb",
        "terror",
        "terrorist",
        "rape",
        "raping",
        "slaughter",
        "massacre",
        "attack",
        "stab",
        "stabbing",
        "beat",
        "beating",
        "die",
        "death",
        "suicide",
    ],
    harmful: [
        "nazi",
        "hitler",
        "kkk",
        "racist",
        "racism",
        "bigot",
        "bigotry",
        "homophobic",
        "transphobic",
        "hate",
        "hateful",
        "slur",
        "retard",
        "retarded",
    ],
    spam: [
        "free money",
        "click here",
        "win now",
        "limited time",
        "urgent",
        "bitcoin",
        "crypto",
        "investment opportunity",
        "get rich quick",
        "join now",
    ],
};

// Function to normalize text (lowercase, remove punctuation, normalize leetspeak)
function normalizeText(text) {
    let normalized = text.toLowerCase();

    // Remove common punctuation
    normalized = normalized.replace(/[^\w\s]/g, "");

    // Version with spaces for normal checks
    const normalizedWithSpaces = normalized.replace(/\s+/g, " ");

    // Version with NO spaces for tricks like 's e x'
    const normalizedNoSpaces = normalized.replace(/\s+/g, "");

    // Expand leetspeak substitutions
    let expandedWithSpaces = normalizedWithSpaces;
    let expandedNoSpaces = normalizedNoSpaces;

    for (let i = 0; i < expandedWithSpaces.length; i++) {
        const char = expandedWithSpaces[i];

        for (const [originalChar, leetReplacements] of Object.entries(
            leetMap,
        )) {
            if (leetReplacements.includes(char)) {
                expandedWithSpaces =
                    expandedWithSpaces.slice(0, i) +
                    originalChar +
                    expandedWithSpaces.slice(i + 1);
                break;
            }
        }
    }

    for (let i = 0; i < expandedNoSpaces.length; i++) {
        const char = expandedNoSpaces[i];

        for (const [originalChar, leetReplacements] of Object.entries(
            leetMap,
        )) {
            if (leetReplacements.includes(char)) {
                expandedNoSpaces =
                    expandedNoSpaces.slice(0, i) +
                    originalChar +
                    expandedNoSpaces.slice(i + 1);
                break;
            }
        }
    }

    return {
        withSpaces: normalizedWithSpaces,
        noSpaces: normalizedNoSpaces,
        leetWithSpaces: expandedWithSpaces,
        leetNoSpaces: expandedNoSpaces,
    };
}

export function checkContentModeration(text) {
    if (!text || !text.trim()) {
        return { isBlocked: false, violations: [] };
    }

    const { withSpaces, noSpaces, leetWithSpaces, leetNoSpaces } =
        normalizeText(text);
    const violations = new Set();

    // Check all blocked term categories
    for (const [category, terms] of Object.entries(blockedTerms)) {
        for (const term of terms) {
            if (
                withSpaces.includes(term) ||
                noSpaces.includes(term) ||
                leetWithSpaces.includes(term) ||
                leetNoSpaces.includes(term)
            ) {
                violations.add(category);
            }
        }
    }

    return {
        isBlocked: violations.size > 0,
        violations: Array.from(violations),
    };
}
