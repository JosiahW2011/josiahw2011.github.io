var game = {
	width: 30,
	height: 16,
	totalMine: 99,
	flagged: 0,
	started: true,
	mineSetted: false,
	won: false,
	lost: false,
	map: [...Array(16)].map(()=>[...new Array(30)].map(()=>new Tile("tile", 0, 0)))
}
game.start = function(){
	game.setNewMap(game.width, game.height, game.totalMine, {x:0, y:0})
	UI.start()
}
game.restart = function(){
	game.won = false
	game.lost = false
	game.flagged = 0
	game.started = true
	game.mineSetted = false
	game.map = [...Array(16)].map(()=>[...new Array(30)].map(()=>new Tile("tile", 0, 0)))
}
game.onClick = function(x, y){
	if(!game.mineSetted){
		game.setNewMap(game.width, game.height, game.totalMine, {x:x, y:y})
		game.mineSetted = true
	}
	game.open(x, y)
}
game.onRightClick = function(x, y){
	game.flag(x,y)
}
game.open = function(x, y){
	if(game.lost)
		return
	if(game.map[y][x].state!="open"){
		game.map[y][x].number = game.mineNumOn(x, y)
		game.map[y][x].state = "open"
		if(game.map[y][x].number==0){
			game.neighbors(x, y).forEach(e=>{
				if(game.map[e.y][e.x].state=="close")
					game.open(e.x, e.y)
			})
		}
	}
	else if(game.map[y][x].state=="open"){
		if(game.map[y][x].number==game.flagNumOn(x, y)){
			game.neighbors(x, y).forEach(e=>{
				if(game.map[e.y][e.x].state!="flag"&&game.map[e.y][e.x].state!="open"){
					game.open(e.x, e.y)
				}
			})
		}
	}
	if(game.map[y][x].type=="mine"){
		game.lost = true
		game.started = false
	}
	if(game.allEnd()){
		game.won = true
		game.started = false
	}
}
game.allEnd = function(){
	let allEnd = true
	game.map.forEach(
		e=>{e.forEach(t=>{
			if(t.type=="tile"&&t.state!="open"){
				allEnd = false
				return
			}
			if(t.type=="mine"&&t.state!="flag"){
				allEnd = false
				return
			}
		})}
	)
	return allEnd
}
game.flag = function(x, y){
	if(game.map[y][x].state=="open"||game.lost)
		return false
	if(game.map[y][x].state=="question")
		game.map[y][x].state = "close"
	else if(game.map[y][x].state=="flag"){
		game.flagged -= 1
		game.map[y][x].state = "question"
	}
	else if(game.map[y][x].state=="close"){
		game.map[y][x].state = "flag"
		game.flagged += 1
	}
	if(game.allEnd()){
		game.won = true
		game.started = false
	}
}
game.setNewMap = function(w, h, m, clickedTile){
	let map = new Array(m).fill(1).concat(new Array(w*h-m-1).fill(0))
	for(let i=map.length-1;i>0;i--){
		let rand = Math.floor(i*Math.random())
		let temp = map[i]
		map[i] = map[rand]
		map[rand] = temp
	}
	map.splice(30*clickedTile.y+clickedTile.x, 0, 0) //insert zero to clicked tile
	map.map((e,i)=>{
		let x = i%game.width
		let y = (i-x)/game.width
		if(e)
			game.map[y][x].type = "mine"
		else
			game.map[y][x].type = "tile"
		game.map[y][x].x = x
		game.map[y][x].y = y
	})
}

