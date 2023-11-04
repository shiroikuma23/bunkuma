// import the packages

import express from 'express'
import morgan from 'morgan'
import { engine } from 'express-handlebars'
import { v4 as uuidv4, v4 } from 'uuid'
import { EventSource } from 'express-ts-sse'

// default to 3000 if PORT env is not set 
const port = process.env.PORT || 3000;

// Create instance of SSE
const sse= new EventSource()

//create an instance of application
const app = express()

//configure render
////default layout false to get form layout
app.engine('html', engine({ defaultLayout: false}))
app.set('view engine', 'html')

//log incoming request
app.use(morgan('combined'))

//POST /chess, tell express how to handle payload
////substring, gameid to get uuid, up to 8 characters
////express: can only send result once (either render/send)
app.post('/chess', express.urlencoded({extended:true}), (req,resp)=>{
    const gameId=v4().substring(0,8)
    const orientation='white'
    resp.status(200).render('chess', {gameId, orientation})
}
)

// GET/chess?gameId=abc123
app.get('/chess', (req,resp)=>{
    const gameId=req.query.gameId
    const orientation= 'black'
    resp.status(200).render('chess', {gameId, orientation})
})

//PATCH/chess/:gameId
app.patch('/chess/:gameId', express.json(), (req,resp)=>{
    //Get gameId from resouce 
    const gameId=req.params.gameId
    const move =req.body

    console.info(`GameId: ${gameId}: `, move)
    //other libraries need to do this (binary-non-binary):
    //sse.send({event: gameId, data:JSON.stringify(data)})
    sse.send({event: gameId,data: move})

    resp.status(201).json({timestamp: (new Date()).getTime() })
})

// GET /chess/stream
// Prod server: only write to socket that belongs to this gate 
// Demo: pushes to everything in realtime 
app.get('/chess/stream', sse.init)

//Serve files from static
app.use(express.static(__dirname+'/static'))

//start express
app.listen(port, () => {
    console.info(`Application bound to port ${port} at ${new Date()}`)
})

