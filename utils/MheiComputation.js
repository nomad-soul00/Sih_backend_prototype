import { chooseStandard, calculateWi, getMetalLabelsFromContributions } from "./HmpiComputation.js";


function calculateNormalizedWeights(relativeWeights, metals) {
    if (typeof metals !== 'object' || metals === null) {
        throw new Error("`metals` must be a non-null object.");
    }

    const selectedKeys = Object.keys(metals);

    const filteredRW = {};
    for (const metal of selectedKeys) {
        if (relativeWeights[metal] !== undefined) {
            filteredRW[metal] = relativeWeights[metal];
        } else {
            console.warn(`Metal '${metal}' not found in relativeWeights.`);
        }
    }

    const total = Object.values(filteredRW).reduce((acc, val) => acc + val, 0);

    const weights = {};
    for (const metal in filteredRW) {
        weights[metal] = parseFloat((filteredRW[metal] / total).toFixed(7));
    }

    return weights;
}

function calculateIndividualMHEIPerMetal(Qi, relativeWi) {
    const contributions = {};

    for (const metal in Qi) {
        if (relativeWi.hasOwnProperty(metal)) {
            contributions[metal] = +(Qi[metal] * relativeWi[metal]).toFixed(6);
        }
    }

    return contributions;
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
                Qi[metal] = parseFloat(((Math.abs(Mi - Ii) / denominator) * 100).toFixed(6));
            } else {
                Qi[metal] = 0;
            }

        }

    }

    return Qi;
}

function FilterMhei(conc, Ii) {
    const category = {};
    for (const metal in conc) {
        if (conc[metal] > Ii[metal]) {
            category[metal] = "PEI";
        } else {
            category[metal] = "NEI";
        }
    }
    return category;
}

function getPEI(MPM, PNC) {
    let PEI = 0;
    for (const metal in PNC) {
        if (PNC[metal] === 'PEI') {
            PEI += MPM[metal];
        }
    }
    return parseFloat((PEI).toFixed(2));
}

function getNEI(MPM, PNC) {
    let NEI = 0;
    for (const metal in PNC) {
        if (PNC[metal] === 'NEI') {
            NEI += MPM[metal];
        }
    }
    return parseFloat((NEI).toFixed(2));
}

function getWaterQuality(NEI, PEI) {
    if (NEI >= -100 && NEI <= 0 && PEI === 0) {
        return "Excellent";
    } else if (NEI > -100 && NEI <= 0 && PEI > 0 && PEI <= 50) {
        return "Good";
    } else if (NEI > -100 && NEI <= 0 && PEI > 50 && PEI <= 100) {
        return "Moderate";
    } else if (NEI > -100 && NEI <= 0 && PEI > 100) {
        return "Poor";
    } else if (NEI === 0 && PEI > 100) {
        return "Unsuitable";
    } else {
        return "Invalid values or no classification available";
    }
}

const getPercentageContributionPerMetal = (Qi, relative_Wi) => {
    const peiContributions = {};

    let totalPEI = 0;

    // First calculate ωi * Qi for all metals
    Object.keys(Qi).forEach((metal) => {
        const wi = relative_Wi[metal];
        const qi = Qi[metal];

        if (wi != null && qi != null) {
            const contribution = wi * qi;
            peiContributions[metal] = contribution;
            totalPEI += contribution;
        }
    });

    // Now calculate percentage contribution
    const percentageContributions = {};
    Object.keys(peiContributions).forEach((metal) => {
        const percentage = (peiContributions[metal] / totalPEI) * 100;
        percentageContributions[metal] = +percentage.toFixed(2); // Rounded to 2 decimal places
    });

    return percentageContributions;
};



export const MheiComputation = (data, standard) => {
    const S1 = chooseStandard(standard);
    const IdealValues = { As: 0.00, Pb: 0, Cr: 0, Cd: 0, Se: 0, Ni: 0, Mn: 0.1, Zn: 5, Cu: 0.05, Fe: 0, Hg: 0 }

    const Wi = calculateWi(S1);




    const processData = data.map((entry) => {
        const { Location, Latitude, Longitude, ...metals } = entry;
        const Qi = calculateQi(metals, S1, IdealValues);

        const tempMheiPerMetal = calculateIndividualMHEIPerMetal(Qi, Wi); 
        const relative_Wi = calculateNormalizedWeights(Wi, tempMheiPerMetal); 

        const MheiPerMetal = calculateIndividualMHEIPerMetal(Qi, relative_Wi);

        const concentrations = {};
        Object.keys(MheiPerMetal).forEach((metal) => {
            concentrations[metal] = metals[metal] ?? null; 
        });

        const PEI_NEI_category = FilterMhei(concentrations, IdealValues);
        const PEI = getPEI(MheiPerMetal, PEI_NEI_category);
        const NEI = getNEI(MheiPerMetal, PEI_NEI_category);
        const readableMetalLabels = getMetalLabelsFromContributions(MheiPerMetal);
        const waterQuality = getWaterQuality(NEI, PEI);
        const percentageContributions = getPercentageContributionPerMetal(Qi, relative_Wi);




        return {
            location: Location,
            coordinates: { latitude: Latitude, longitude: Longitude },
            Qi, Wi, relative_Wi, MheiPerMetal, percentageContributions, concentrations, PEI_NEI_category, PEI, NEI, Metals: readableMetalLabels, waterQuality
        };
    })


    return { processData, S1, IdealValues };
}       