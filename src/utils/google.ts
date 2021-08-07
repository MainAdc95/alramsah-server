const propertyId = "282036600";
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

const analyticsDataClient = new BetaAnalyticsDataClient();

export async function runReport() {
    const [visitedCountries] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: "today",
                endDate: "today",
            },
        ],
        dimensions: [
            {
                name: "countryId",
            },
        ],
        metrics: [
            {
                name: "activeUsers",
            },
        ],
    });

    return { visitedCountries };
}
