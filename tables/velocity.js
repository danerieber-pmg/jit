import Jira from "@danerieber/jira-get";
import dayjs from "dayjs";
dayjs().format();
import { createObjectCsvWriter } from "csv-writer";

const jira = new Jira(process.env.URL, process.env.EMAIL, process.env.TOKEN);
const boardId = process.env.BOARD_ID;
const fid = await jira.get('/rest/api/2/field')
    .map(f => [f.name, f.id])   // maps field names -> field ides
    .select(Object.fromEntries);

let sprints = await jira.get(`/rest/agile/1.0/board/${boardId}/sprint`)
    .params({
        state: 'active,closed'
    })
    .select(r => r.values)
    .filter(v => v.originBoardId == boardId)    // only get sprints that are actually on this specific board
    .map(({ id, name, startDate, endDate }) =>
        ({ id, name, start: dayjs(startDate), end: dayjs(endDate) })) // dayjs values are easier to deal with
    .all();

const N_SPRINTS = 5;
sprints = sprints.sort((a, b) => b.start - a.start).slice(0, N_SPRINTS).reverse();  // get N most recent sprints

const DAY_FORMAT = 'YYYY-MM-DD';    // used for grouping by days

let allIssues = []; // collects all issues across all sprints
for (const sprint of sprints) {
    const issues = await jira.get(`/rest/agile/1.0/board/${boardId}/sprint/${sprint.id}/issue`) .params({ jql: `status = Completed and "Story Points" is not empty`, fields: [fid['Story Points'], fid['Resolved']] }) .select(r => r.issues) .map(({ fields }) => ({ points: fields[fid['Story Points']],
            resolved: dayjs(fields[fid['Resolved']]).format(DAY_FORMAT)
        }))
        .all();
    allIssues = allIssues.concat(issues);
}

const pointsPerDay = {} // groups issues by day and aggregates story points
for (const issue of allIssues) {
    if (!(issue.resolved.day in pointsPerDay)) pointsPerDay[issue.resolved] = 0;
    pointsPerDay[issue.resolved] += issue.points;
}

let results = [];   // lists each day, the total completed story points, and the associated sprint
for (const day in pointsPerDay) {
    results.push({ day: dayjs(day), points: pointsPerDay[day] });
}
results = results.sort((a, b) => a.day - b.day);
results = results.map(({ day, points }) => ({
    day: day.format(DAY_FORMAT),
    points,
    sprint: sprints.filter(s => s.start <= day && day <= s.end)[0]?.name
}));
results = results.filter(r => r.sprint)

const csvWriter = createObjectCsvWriter({
    path: './csv/velocity.csv',
    header: Object.keys(results[0]).map(k => ({ id: k, title: k }))
});
await csvWriter.writeRecords(results);