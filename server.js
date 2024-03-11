const pg = require('pg')
const express = require('express')
const app = express()
const client = new pg.Client(process.env.DATABASE_URL||'postgres://localhost/acme_hr_directory')
client.connect()
app.use(require('morgan')('dev'))
app.use(express.json())
const port = 3000
const init = async ()=>{
    const SQL = `
    DROP TABLE IF EXISTS departments CASCADE;
    CREATE TABLE departments(
    id serial PRIMARY KEY,
    name VARCHAR(255) 
    );
    DROP TABLE IF EXISTS employees;
    CREATE TABLE employees(
    id serial PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    department_id INTEGER REFERENCES departments(id) NOT NULL
    );
    INSERT INTO departments(name) VALUES('Store');
    INSERT INTO departments(name) VALUES('Warehouse');
    INSERT INTO departments(name) VALUES('Manufacturing');
    INSERT INTO departments(name) VALUES('Corporate');
    INSERT INTO departments(name) VALUES('Technology');
    INSERT INTO employees(name, department_id) VALUES('Annie', (SELECT id FROM departments WHERE name = 'Manufacturing'));
    INSERT INTO employees(name, department_id) VALUES('Bobby', (SELECT id FROM departments WHERE name = 'Warehouse'));
    INSERT INTO employees(name, department_id) VALUES('Carla', (SELECT id FROM departments WHERE name = 'Corporate'));
    INSERT INTO employees(name, department_id) VALUES('David', (SELECT id FROM departments WHERE name = 'Store'));
    INSERT INTO employees(name, department_id) VALUES('Eli', (SELECT id FROM departments WHERE name = 'Technology'));
    INSERT INTO employees(name, department_id) VALUES('Giselle', (SELECT id FROM departments WHERE name = 'Store'));
    INSERT INTO employees(name, department_id) VALUES('Harold', (SELECT id FROM departments WHERE name = 'Technology'));
    INSERT INTO employees(name, department_id) VALUES('Iris', (SELECT id FROM departments WHERE name = 'Store'));
    INSERT INTO employees(name, department_id) VALUES('Jackie', (SELECT id FROM departments WHERE name = 'Corporate'));
    INSERT INTO employees(name, department_id) VALUES('Karen', (SELECT id FROM departments WHERE name = 'Corporate'));
    INSERT INTO employees(name, department_id) VALUES('Lila', (SELECT id FROM departments WHERE name = 'Warehouse'));
    INSERT INTO employees(name, department_id) VALUES('Mark', (SELECT id FROM departments WHERE name = 'Warehouse'));
    INSERT INTO employees(name, department_id) VALUES('Nathan', (SELECT id FROM departments WHERE name = 'Manufacturing'));
    INSERT INTO employees(name, department_id) VALUES('Oswald', (SELECT id FROM departments WHERE name = 'Manufacturing'));
    INSERT INTO employees(name, department_id) VALUES('Peter', (SELECT id FROM departments WHERE name = 'Technology'));
    `
    const response = await client.query(SQL)
}

app.get('/api/departments', async (req, res, next)=>{
    try {
        const SQL = `
        SELECT * FROM departments;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (ex) {
        next(ex)
    }
})

app.get('/api/employees', async (req, res, next)=>{
    try {
        const SQL = `
        SELECT * FROM employees;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (ex) {
        next(ex)
    }
})

app.post('/api/employees', async (req, res, next)=>{
    try {
        const SQL = `
        INSERT INTO employees(name, department_id)
        VALUES($1,$2)
        RETURNING *;
        `
        const response = await client.query(SQL, [req.body.name, req.body.department_id])
        res.send(response.rows[0]);
    } catch (ex) {
        next(ex)
    }
})

app.put('/api/employees/:id', async (req, res, next)=>{
    try {
        const SQL = `
        UPDATE employees
        SET name = $1, department_id = (SELECT id from departments where name = $2), updated_at=now()
        WHERE id = $3
        RETURNING *;
        `
        const response = await client.query(SQL, [req.body.name, req.body.department_id, req.params.id])
        res.send(response.rows[0])
    } catch (ex) {
        next(ex)
    }
})

app.delete('/api/employees/:id', async (req, res, next)=>{
    try {
        const SQL = `
        DELETE from employees
        WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (ex) {
        next(ex)
    }
})

app.listen(port, ()=>{
    console.log(`I am listening at port ${port} and the data is seeded`)
})

init()