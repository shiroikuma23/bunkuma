//Access <body>
const body =document.querySelector('body')

//access data attribute to retrieve gameId and orientation
const gameId =body.dataset.gameid
const orientation =body.dataset.orientation
console.info(`gameId: ${gameId}, orientation: ${orientation}`)

//Handle onDrop
const onDrop=(src, dst,piece)=>{
    console.info(`src=${src}, dst=${dst}, piece=${piece}`)

    //construct the move
    const move = {src, dst, piece}

    //PATCH//chess/:gameId
    fetch(`/chess/${gameId}`, {
        method:'PATCH',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(move)
    })
    .then(resp=>console.info('RESPONSE: ', resp ))
    .catch(err=> console.error('ERROR: ', err))
}


//create chess configuration 
const config={
    draggable:true,
    position:'start',
    orientation,
    onDrop
}

//create instance of chess game 
const chess=Chessboard('chess', config)

//create an SSE Connection
const sse=new EventSource('/chess/stream')
//Receive moves for gameId
sse.addEventListener(gameId, msg=>
    {
        console.info('>>> SSE msg: ', msg)
        //data in text rn 
        //const move=JSON.parse(sg.data)
        const {src, dst, piece} = JSON.parse(msg.data)
        console.info(`src: ${src}, dst=${dst}, piece=${piece}`)
        chess.move(`${src}-${dst}`)
    })
