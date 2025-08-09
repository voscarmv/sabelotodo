const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

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

async function dropTables(){
    const q = `drop table messages; drop table users;`;
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

module.exports = {
    ensureTables,
    dropTables,
    getRecordCol,
    getAllRecords,
    postRecord
}