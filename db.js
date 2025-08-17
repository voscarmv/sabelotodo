const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.db_url,
});

async function ensureTables() {
    const q = `
    create table if not exists users (
      id bigint primary key unique,
      created_at timestamp with time zone default now());
    create table if not exists messages (
      id serial primary key unique,
      user_id bigint references users(id),
      message text not null,
      created_at timestamp with time zone default now());
    `;
    await pool.query(q);
    console.log('🐣 Tables ensured');
}

async function ensureMessageTables() {
    const q = `
    create table if not exists messages (
      id serial primary key unique,
      message text not null);
    `;
    await pool.query(q);
    console.log('🐣 Message tables ensured');
}

async function dropTables(){
    const q = `drop table if exists messages; drop table if exists users;`;
    await pool.query(q);
    console.log('🗑️ Tables dropped');    
}

async function dropMessageTables(){
    const q = `drop table if exists messages;`;
    await pool.query(q);
    console.log('🗑️ Tables dropped');    
}

async function getRecordCol(table, column, id){
    const { rows } = await pool.query(`select ${column} from ${table} where id = $1`, [id]);
    return rows;
}

async function getAllRecords(table, filter){
    const key = Object.keys(filter)[0];
    const value = Object.values(filter)[0];
    const { rows } = await pool.query(`select * from ${table} where ${key} = ${value} order by created_at asc;`);
    return rows;
}

async function postRecord(table, record = {}){
    const keys = Object.keys(record);
    const values = Object.values(record);
    let kys = '';
    let vals = '';
    for(let i = 0; i < values.length; i++){
        kys += `${keys[i]},`;
        vals += `$${i+1},`;
    }
    kys = `(${kys.slice(0,-1)})`;
    vals = `(${vals.slice(0,-1)})`;
    const result = await pool.query(
        `insert into ${table} ${kys} values${vals} returning id`,
        values
    );
    return result.rows[0].id;
}

async function postMessage(msg){
    await pool.query(
        `insert into messages (message) values('${JSON.stringify(msg)}');`,
    );
}

async function getAllMessages(){
    const { rows } = await pool.query(`select * from messages order by id asc`);
    return rows;
}

module.exports = {
    ensureTables,
    dropTables,
    ensureMessageTables,
    dropMessageTables,
    getRecordCol,
    getAllRecords,
    postRecord,
    postMessage,
    getAllMessages
}