import Jira from "@danerieber/jira-get";
import dayjs from "dayjs";
dayjs().format();
import { createObjectCsvWriter } from "csv-writer";



const jira = new Jira(process.env.URL, process.env.EMAIL, process.env.TOKEN);



async function mapFieldsToIds() {
    return await jira
        .get('/rest/api/2/field')
        .map(f => [f.name, f.id])   // maps field names -> field ides
        .select(Object.fromEntries);
}
const fid = await mapFieldsToIds();



async function getAllIssues() {
    return await jira
        .get('/rest/api/2/search')
        .params({
            jql: 'project = ALLI order by created asc',
            fields: [fid['Created'], fid['Resolved']]
        })
        .select(r => r.issues)
        .map(({fields}) => ({
            created: fields[fid['Created']],
            resolved: fields[fid['Resolved']]
        }))
        .all();
}
const results = await getAllIssues();



async function writeToCsv(results) { 
    await createObjectCsvWriter({
        path: './csv/issues.csv',
        header: Object.keys(results[0]).map(k => ({ id: k, title: k }))
    })
        .writeRecords(results);
}
await writeToCsv(results);