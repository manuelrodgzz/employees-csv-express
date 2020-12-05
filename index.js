const express = require('express')
const fs = require('fs')
const app = express()

app.get('/employee/:id?/:columnName?', function(req, res) {

    const id = req.params.id
    const columnName = req.params.columnName

    fs.readFile('employees.csv', 'utf8', function(err, data) {
        if (err) {
            console.error(err.message)
            res.status(500).json({
                error: 500,
                message: err.message
            })
        }

        //get columns names
        const keys = data.split('\n')[0].split(',')

        if(columnName && !keys.includes(columnName)){
            return res.status(400).json({
                error: 400,
                message: 'Requested column was not found'
            })
        }
        
        //get array of employees' objects
        result = data.split('\n').slice(1).map(row => {

            let entries = row.split(',').map((value, index) => [keys[index], value])

            return Object.fromEntries(columnName ? entries.filter(entry => [columnName, 'id'].includes(entry[0])) : entries)
        }).filter(employee => employee.id === id)
        
        //if client did not send an Id, csv string is sent
        if(!id){
            res.send(data)
            return
        }

        result = result[0]

        //if user was found
        if(result){

            //if client sent columnName
            if(columnName){
                delete result.id
            }
            res.json(result)
        }
        else
            res.status(404).json({
                error: 404,
                message: 'Requested user was not found'
            })
    })
})

app.listen(3000, function() {
  console.log('Listening on port 3000')
})