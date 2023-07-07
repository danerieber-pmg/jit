import Jira from "@danerieber/jira-get";



export const jira = new Jira(process.env.URL, process.env.EMAIL, process.env.TOKEN);



async function mapFieldsToIds() {
    return await jira
        .get('/rest/api/2/field')
        .map(f => [f.name, f.id])   // maps field names -> field ides
        .select(Object.fromEntries);
}
export const fid = await mapFieldsToIds();