/*
 * Usage:
 * 	var mSprite = new Sprite("./spriteSource.png", x, y, w, h)
 * 	mSprite.draw(ctx, x, y)
 */

function Sprite(source, x, y, width, height){
	this.source = source
	this.x = x
	this.y = y
	this.width = width
	this.height = height
	//ctx.drawImage(img, x, y)
}
Sprite.prototype.draw = function(ctx, x, y){
	ctx.drawImage(this.source,
				  this.x, this.y, this.width, this.height,
				  x, 	  y,	  this.width, this.height
	)
}

Sprite.loadSource = function(source){
	let img = new Image()
	img.src = source
	//document.getElementById("sprites").appendChild(img)
	return img
}

