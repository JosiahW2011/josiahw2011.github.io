game.mineNumOn = function(x, y){
	let mineNum = 0
	if(game.map[y][x].type=="mine")
		return undefined
	else{
		game.neighbors(x, y).forEach(
			e=>{
				if(e.type=="mine") mineNum += 1
			}
		)
		return mineNum
	}
}
game.flagNumOn = function(x, y){
	let flagNum = 0
	game.neighbors(x, y).forEach(
		e=>{
			if(e.state=="flag") flagNum += 1
		}
	)
	return flagNum
}
game.neighbors = function(x, y){
	let n = []
	if(game.map[y-1]){
		if(game.map[y-1][x-1]) n.push(game.map[y-1][x-1])
		if(game.map[y-1][x])   n.push(game.map[y-1][x])
		if(game.map[y-1][x+1]) n.push(game.map[y-1][x+1])
	}
	if(game.map[y]){
		if(game.map[y][x-1]) n.push(game.map[y][x-1])
		if(game.map[y][x+1]) n.push(game.map[y][x+1])
	}
	if(game.map[y+1]){
		if(game.map[y+1][x-1]) n.push(game.map[y+1][x-1])
		if(game.map[y+1][x])   n.push(game.map[y+1][x])
		if(game.map[y+1][x+1]) n.push(game.map[y+1][x+1])
	 }
	return n
}

