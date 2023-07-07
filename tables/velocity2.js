import { jira, fid } from './init.js';
import dayjs from "dayjs";
dayjs().format();
import { createObjectCsvWriter } from "csv-writer";



const boardId = process.env.BOARD_ID;
const numSprints = 5;
const dayFormat = 'YYYY-MM-DD';    // used for grouping by days



async function getSprints() {
    return await jira
        .get(`/rest/agile/1.0/board/${boardId}/sprint`)
        .params({
            state: 'active,closed'
        })
        .select(r => r.values)
        .filter(v => v.originBoardId == boardId)    // only get sprints that are actually on this specific board
        .map(({ id, name, startDate, endDate }) =>
            ({ id, name, start: dayjs(startDate), end: dayjs(endDate) })) // dayjs values are easier to deal with
        .all();
}
let sprints = await getSprints();



function lastN(sprints) {
    return sprints
        .sort((a, b) => b.start - a.start)
        .slice(0, numSprints)
        .reverse();
}
sprints = lastN(sprints);



async function collectAllIssues(sprints) {
    const getIssueInfo = async (sprint) =>
        await jira
            .get(`/rest/agile/1.0/board/${boardId}/sprint/${sprint.id}/issue`)
            .params({
                jql: `status = Completed and "Story Points" is not empty`,
                fields: [fid['Story Points'], fid['Resolved']]
            })
            .select(r => r.issues)
            .map(({ fields }) => ({
                points: fields[fid['Story Points']],
                resolved: dayjs(fields[fid['Resolved']]).format(dayFormat)
            }))
            .all();
    let allIssues = []
    for (const sprint of sprints) {
        allIssues = allIssues.concat(await getIssueInfo(sprint));
    }
    return allIssues;
};
const allIssues = await collectAllIssues(sprints);



function groupAndAggregate(allIssues) {
    const pointsPerDay = {} // groups issues by day and aggregates story points
    for (const issue of allIssues) {
        if (!(issue.resolved.day in pointsPerDay)) {
            pointsPerDay[issue.resolved] = 0;
        }
        pointsPerDay[issue.resolved] += issue.points;
    }
    return pointsPerDay;
}
const pointsPerDay = groupAndAggregate(allIssues);



function constructResults(pointsPerDay, sprints) {
    let results = [];   // lists each day, the total completed story points, and the associated sprint
    const formatRow = (day) => (
        {
            day: dayjs(day),
            points: pointsPerDay[day]
        }
    );
    for (const day in pointsPerDay) {
        results.push(formatRow(day));
    }

    const ascending = (a, b) => a.day - b.day;
    results = results.sort(ascending);

    const attachSprint = ({ day, points }) => ({
        day: day.format(dayFormat),
        points,
        sprint: sprints.filter(s => s.start <= day && day <= s.end)[0]?.name
    });
    results = results.map(attachSprint);

    const hasSprint = r => r.sprint;
    results = results.filter(hasSprint)
    return results;
}
const results = constructResults(pointsPerDay, sprints);



async function writeToCsv(results) { 
    await createObjectCsvWriter({
        path: './csv/velocity2.csv',
        header: Object.keys(results[0]).map(k => ({ id: k, title: k }))
    })
        .writeRecords(results);
}
await writeToCsv(results);