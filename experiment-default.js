/*

USAGE: node experiment-default.js [number_of_persons[_locations]] [query]

*/

const newEngine = require('@comunica/actor-init-sparql').newEngine;
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

const myEngine = newEngine();
let startUsage;
let startTime;
let executionStart;

async function init() {
  // Init metrics
  startTime = Date.now();
  startUsage = process.cpuUsage();
  executionStart = process.hrtime();

  let sources = [];
  const numberOfPersons = process.argv[2] || '10'; // if locations must be included, provide '<numberOfPersons>_locations' as argument
  const file = path.join('C:\\Users\\thoma\\Documents\\Master\\Masterproef\\Implementatie\\experiments\\ldbc-snb-decentralized',`persons_${numberOfPersons}_filepaths.txt`);
  const baseUrl = 'http://localhost:3000';

  const prefixes = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX sn: <${baseUrl}/www.ldbc.eu/ldbc_socialnet/1.0/data/>
  PREFIX snvoc: <${baseUrl}/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
  PREFIX sntag: <${baseUrl}/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX dbpedia: <${baseUrl}/dbpedia.org/resource/>
  PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n`;
  const query = process.argv[3] ||
  `SELECT ?person WHERE { ?person snvoc:firstName "Tom" . }
  `;
  const sparqlQuery = prefixes.concat(query);

  const readInterface = readline.createInterface({
    input: fs.createReadStream(file)
  });

  const patternPath = /out-fragments\/http\/localhost_3000\/(.*).nq/;
  readInterface.on('line', (line) => {
    const matchesPath = line.match(patternPath);
    sources.push(`${baseUrl}/${matchesPath[1]}`);
  });

  readInterface.on('close', () => {
    executeQuery(sparqlQuery, sources);
  });
}

async function executeQuery(query, sources) {
  const result = await myEngine.query(query, {
    sources: sources
  });

  let { data } = await myEngine.resultToString(result, 'stats');
  // let { data } = await myEngine.resultToString(result, 'table');
  data.pipe(process.stdout);

  data.on('end', () => {
    // Print metrics
    const executionEnd = process.hrtime(executionStart);
    console.log(`|\t|\t|\t\tQuery execution time: ${(executionEnd[0] + executionEnd[1]/1e9).toFixed(3)}s`);
    const endTime = Date.now();
    const cpuUsage = process.cpuUsage(startUsage);
    const cpuPercentage = 100 * ((cpuUsage.user + cpuUsage.system)/os.cpus().length) /
      ((endTime - startTime) * 1000);
    console.log(`|\t|\t|\t\tCPU load: ${cpuPercentage.toFixed(2)}%`);
    const memory = process.memoryUsage();
    console.log(`|\t|\t|\t\tMemory usage: ${(memory.rss/1024/1024).toFixed(2)} MB\n|\t|\t|`);
  });

  data.on('error', (error) => {
    console.error(error);
  });
}

init();
