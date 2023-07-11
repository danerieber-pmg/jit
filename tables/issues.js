import { jira, fid } from './init.js';
import dayjs from "dayjs";
dayjs().format();
import { createObjectCsvWriter } from "csv-writer";



const CSV_PATH = './csv/issues.csv';



async function getAllIssues() {
    return await jira
        .get('/rest/api/2/search')
        .params({
            jql: 'project = ALLI order by created asc',
            fields: [fid['Created'], fid['Resolved'], fid['Status'], fid['Assignee'], fid['Responsible Team'], fid['Story Points']]
        })
        .select(r => r.issues)
        .map(({id, fields}) => ({
            id,
            created: fields[fid['Created']],
            resolved: fields[fid['Resolved']],
            status: fields[fid['Status']].name,
            assignee: fields[fid['Assignee']]?.displayName,
            team: fields[fid['Responsible Team']]?.value,
            points: fields[fid['Story Points']],
        }))
        .all();
}
const results = await getAllIssues();



async function writeToCsv(results) { 
    await createObjectCsvWriter({
        path: CSV_PATH,
        header: Object.keys(results[0]).map(k => ({ id: k, title: k }))
    })
        .writeRecords(results);
}
await writeToCsv(results);