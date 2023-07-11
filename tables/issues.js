import { jira, fid } from './init.js';
import dayjs from 'dayjs';
dayjs().format();
import { createObjectCsvWriter } from 'csv-writer';
import AWS from 'aws-sdk';
import fs from 'fs';



const CSV_PATH = 'jit_issues.csv';
const DAY_FORMAT = 'YYYY-MM-DD';



async function getAllIssues() {
    return await jira
        .get('/rest/api/2/search')
        .params({
            jql: 'project = ALLI order by created asc',
            fields: [fid['Created'], fid['Resolved'], fid['Status'], fid['Assignee'], fid['Responsible Team'], fid['Story Points']]
        })
        .select(r => r.issues)
        .map(({ id, fields }) => ({
            id,
            created: dayjs(fields[fid['Created']]).format(DAY_FORMAT),
            resolved: dayjs(fields[fid['Resolved']]).format(DAY_FORMAT),
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



function sendToS3(csvPath) {
    const s3 = new AWS.S3();
    const fileStream = fs.createReadStream(csvPath);
    fileStream.on('error', console.error);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: csvPath,
        Body: fileStream
    };
    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.error(`S3 upload error: ${err}`);
        }
        if (data) {
            console.log(`Uploaded to ${data.Location}`);
        }
    });
}
sendToS3(CSV_PATH);