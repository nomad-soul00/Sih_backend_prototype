

export const getMetalLabelsFromContributions = (metalContributions) => {
    const metalLabels = {
    Pb: "Lead",
    Cd: "Cadmium",
    Hg: "Mercury",
    As: "Arsenic",
    Cr: "Chromium",
    Cu: "Copper",
    Zn: "Zinc",
    Ni: "Nickel",
    Fe: "Iron",
    Mn: "Manganese",
    Se: "Selenium"
};
    if (!metalContributions || typeof metalContributions !== "object") return {};

    return Object.keys(metalContributions)
        .filter((key) => metalLabels[key]) // Only known metals
        .reduce((acc, key) => {
            acc[key] = `${metalLabels[key]} (${key})`;
            return acc;
        }, {});
};



 export function chooseStandard(standard) {
    if (standard === "BIS") {
        return {
            Pb: 0.01,
            Cd: 0.003,
            Hg: 0.001,
            As: 0.05,
            Cr: 0.05,
            Cu: 1.5,//
            Zn: 15.0, //
            Ni: 0.02,
            Fe: 0.3,
            Mn: 0.3,
            Se: 0.01
        };
    };

    if (standard === "WHO") {
        return {
            Cd: 0.003,
            Pb: 0.01,
            Hg: 0.006,
            As: 0.01,
            Cr: 0.05,
            Cu: 2.0,
            Zn: 0.0,
            Ni: 0.07,
            Fe: 0.0,
            Mn: 0.4,
            Se: 0.01
        };
    }
}

export function calculateWi(Si) {
    const Wi = {};

    for (const metal in Si) {
        const limit = Si[metal];

        Wi[metal] = limit > 0 ? parseFloat((1 / limit).toFixed(3)) : 0;
    }
    return Wi;
}

export function calculateQi(metals, S1, IdealValues) {
    const Qi = {};

    for (const metal in metals) {
        const Mi = metals[metal];
        const Si = S1[metal];
        const Ii = IdealValues[metal];

        if (Mi !== undefined && Si !== undefined && Ii !== undefined) {
            const denominator = Si - Ii;

            if (denominator !== 0) {
                Qi[metal] = parseFloat(((Math.abs(Mi - Ii) / denominator) * 100).toFixed(3));
            } else {
                Qi[metal] = 0;
            }

        }

    }

    return Qi;
}

function calculateHMPI(Wi, Qi) {
    let numerator = 0;
    let denominator = 0;

    for (const metal in Wi) {
        if (Qi[metal] !== undefined) {
            numerator += Wi[metal] * Qi[metal];
            denominator += Wi[metal];
        }
    }

    return denominator === 0 ? 0 : numerator / denominator;
}

function calculatePerMetalHMPI(Wi, Qi) {
    const results = {};

    for (const metal in Wi) {
        const weight = Wi[metal];
        const subIndex = Qi[metal];

        if (weight !== undefined && subIndex !== undefined) {
            results[metal] = parseFloat((weight * subIndex).toFixed(3))

        }

    }
    return results;
}

function categorizeHMPI(hmpi, standard) {
    if (standard === "BIS") {
        if (hmpi < 50) {
            return {
                level: "Safe",
                description: "Water quality is excellent with negligible pollution"
            };
        }
        if (hmpi < 100) {
            return {
                level: "Low",
                description: "Water is considered safe or minimally polluted"
            };
        }
        if (hmpi <= 200) {
            return {
                level: "Moderate",
                description: "Pollution is moderate; may pose some risk"
            };
        }
        if (hmpi <= 300) {
            return {
                level: "High",
                description: "Pollution is high; requires action"
            };
        }
        return {
            level: "Critical",
            description: "Pollution is critical; immediate remedial measures needed"
        };
    }

    if(standard === 'WHO') {
         if (hmpi < 50) {
            return {
                level: "Safe",
                description: "Suitable for drinking"
            };
        }
        if (hmpi < 100) {
            return {
                level: "Moderate",
                description: "Caution advised"
            };
        }
        return {
            level: "Critical",
            description: "Not suitable for drinking"
        };
    }

}

function generateNotes(Qi) {
    const highMetals = Object.entries(Qi)
        .filter(([metal, value]) => value > 100)
        .map(([metal]) => metal);

    if (highMetals.length === 0) return "Within acceptable limits";
    return `Elevated levels of: ${highMetals.join(", ")}`;
}

function calculatePercentageComposition(Wi, Qi) {
    const composition = {};
    let total = 0;

    for (const metal in Wi) {
        if (Qi[metal] !== undefined) {
            total += Wi[metal] * Qi[metal];
        }
    }

    for (const metal in Wi) {
        if (Qi[metal] !== undefined && total > 0) {
            composition[metal] = parseFloat((((Wi[metal] * Qi[metal]) / total) * 100).toFixed(3));
        }
    }

    return composition;
}

function calculateContaminationDegree(metals, standardLimits) {
    let Cd = 0;

    for (const metal in metals) {
        const Ci = metals[metal];
        const Si = standardLimits[metal];

        if (Ci !== undefined && Si !== undefined && Si !== 0) {
            Cd += Ci / Si;
        }
    }

    return parseFloat(Cd.toFixed(3));
}


export const HmpiComputation = (data, standard) => {
    const S1 = chooseStandard(standard);
    const IdealValues = { As: 0.01, Pb: 0, Cr: 0, Cd: 0, Se: 0, Ni: 0, Mn: 0.1, Zn: 5, Cu: 0.05, Fe: 0, Hg: 0 }

    const Wi = calculateWi(S1);

    const processData = data.map((entry) => {
        const { Location, Latitude, Longitude, ...metals } = entry;
        const Qi = calculateQi(metals, S1, IdealValues);
        const hmpi = calculateHMPI(Wi, Qi);
        const metalContributions = calculatePerMetalHMPI(Wi, Qi);
        const category = categorizeHMPI(hmpi, standard);
        const notes = generateNotes(Qi);
        const percentageComposition = calculatePercentageComposition(Wi, Qi);
        const contaminationDegree = calculateContaminationDegree(metals, S1);
        const readableMetalLabels = getMetalLabelsFromContributions(metalContributions);

        const concentrations = {};
        Object.keys(metalContributions).forEach((metal) => {
            concentrations[metal] = metals[metal] ?? null; // get input concentration or null if missing
        });


        return {
            location: Location,
            coordinates: { latitude: Latitude, longitude: Longitude },
            HMPI: parseFloat(hmpi.toFixed(3)),
            Qi,
            Wi,
            metalContributions, //individual hmpi
            percentageComposition,
            contaminationDegree,
            category,
            notes,
            Metals: readableMetalLabels,
            concentrations
        };

    })

    return { processData, S1, IdealValues };


}
