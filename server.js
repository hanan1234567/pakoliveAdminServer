'use strict';
const express = require('express')
const connection = require('./config/connection')
const cors = require('cors')
const {adminRoutes, websiteRoutes} = require('./api/routes')
const path=require("path")
const app = express()

var corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001','http://localhost:4001','http://pakolive.com/','https://pakolive.herokuapp.com/'],
    optionsSuccessStatus: 200
  }

app.use(express.json())
app.use(express.static('public'))
app.use(cors())

app.use('/api/portal', websiteRoutes)
app.use('/api/portal', adminRoutes)
const port =process.env.PORT || 4001
 if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '/build');
  console.log(':',publicPath)
  app.use(express.static(publicPath));
  app.use('*', express.static(publicPath));
}

app.listen(port, async () => {
    await connection()    
    console.log(`pakolive app listening at http://localhost:${port}`)
})