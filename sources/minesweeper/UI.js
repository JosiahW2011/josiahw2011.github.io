var UI = {}

UI.mapMarginX = 25
UI.mapMarginY = 100

UI.drawMap = function(ctx, map){
	map.forEach(
		(e,y)=>{
			e.forEach((t, x)=>{
				let coord = [UI.mapMarginX+25*x, UI.mapMarginY+25*y]
				if(t.state=="close"){
					s.tile.draw(ctx, ...coord)
				}
				if(t.state=="open"){
					if(t.type=="tile")
						s.tile_num[t.number].draw(ctx, ...coord)
					if(t.type=="mine")
						s.mine.draw(ctx, ...coord)
				}
				if(t.state=="flag"){
					s.flag.draw(ctx, ...coord)
				}
				if(t.state=="question")
					s.question.draw(ctx, ...coord)
			})
		}
	)
}
UI.drawMineNumber = function(n, ctx, x, y){
	n = n.toString()
	for(let i=0;i<n.length;i++){
		if(n[i]=="-") s.minus.draw(ctx, x+30*i, y)
		else s.numbers[n[i]].draw(ctx, x+30*i, y)
	}
}
UI.refresh = function(){
	ctx.fillStyle = "#FFFFFF"
	ctx.fillRect(0, 0, 800, 600)
	UI.drawMap(ctx, game.map)
	UI.drawMineNumber(game.totalMine-game.flagged, ctx, 25, 25)
	if(game.lost){
		s.lost.draw(ctx, 150, 25)
		s.restart.draw(ctx, 625, 25)
	}
	if(game.won){
		s.won.draw(ctx, 150, 25)
		s.restart.draw(ctx, 625, 25)
	}
	game.animation = requestAnimationFrame(UI.refresh)
}
UI.start = function(){
	game.animation = requestAnimationFrame(UI.refresh)
}
UI.clickListener = function(e){
	if(UI.locate(e.offsetX, e.offsetY)==undefined)
		return
	if(UI.locate(e.offsetX, e.offsetY)=="restart"){
		game.restart()
		return
	}
	if(game.started)
		game.onClick(...UI.locate(e.offsetX, e.offsetY))
}
UI.rightClickListener = function(e){
	e.preventDefault()
	if(UI.locate(e.offsetX, e.offsetY)==undefined)
		return
	game.onRightClick(...UI.locate(e.offsetX, e.offsetY))
}
UI.locate = function(x, y){
	let cx = x-UI.mapMarginX
	let cy = y-UI.mapMarginY
	cx = Math.floor(cx/25)
	cy = Math.floor(cy/25)
	if(cx>=0 && cx<game.width && cy>=0 && cy<game.height)
		return [cx, cy]
	if(game.won||game.lost){
		if(x>=625 && x<775 && y>=25 && y<75){
			return "restart"
		}
	}
	else
		return undefined
}
var canvas = document.getElementsByTagName("canvas")[0]
canvas.width = 800
canvas.height = 600
var ctx = canvas.getContext("2d")
canvas.addEventListener("click", UI.clickListener)
canvas.addEventListener("contextmenu", UI.rightClickListener)
