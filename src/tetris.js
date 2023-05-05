$(function(){
	window.gameSetting = {
		gameField: $('.gameField'),
		blockSize: 20,
		fieldHeight: 440, //22
		fieldWidth: 280, //14
		keyAccept: false,
		gameEnd: true,
		win: false,
		forceDown: false,
		forceDownSpeed: 1000,
		blockId: 0,
		MaxPreviewBlock: 3,
		lockStore: 0,
		levelDifficulty: 1000,
		colors: ['lightBlue', 'orange', 'purple', 'blue', 'red', 'yellow', 'green'],
		scores: [100, 300, 500, 700]
	};
	
	var gameTitle = [
		[1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
		[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
		[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
		[0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1],
		[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
		[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
		[0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
	];

	var randomValArr = new Uint32Array(1);
	
	var defaultBlocks = {
		'b0':{
			'width': 4,
			'height': 1,
			'color': gameSetting.colors[0],
			'position': [[0, 0], [gameSetting.blockSize, 0], [2 * gameSetting.blockSize, 0], [3 * gameSetting.blockSize, 0]]
		},
		'b1':{
			'width': 2,
			'height': 2,
			'color': gameSetting.colors[1],
			'position': [[0, 0], [gameSetting.blockSize, 0], [0, gameSetting.blockSize], [gameSetting.blockSize, gameSetting.blockSize]],
		},
		'b2':{
			'width': 3,
			'height': 2,
			'color': gameSetting.colors[2],
			'position': [[0, 0], [gameSetting.blockSize, 0], [2 * gameSetting.blockSize, 0], [gameSetting.blockSize, gameSetting.blockSize]],
		},
		'b3':{
			'width': 3,
			'height': 2,
			'color': gameSetting.colors[3],
			'position': [[0, 0], [gameSetting.blockSize, 0], [2 * gameSetting.blockSize, 0], [0, gameSetting.blockSize]],
		},
		'b4':{
			'width': 3,
			'height': 2,
			'color': gameSetting.colors[4],
			'position': [[0, 0], [gameSetting.blockSize, 0], [2 * gameSetting.blockSize, 0], [2 * gameSetting.blockSize, gameSetting.blockSize]],
		},
		'b5':{
			'width': 3,
			'height': 2,
			'color': gameSetting.colors[5],
			'position': [[0, 0], [gameSetting.blockSize, 0], [gameSetting.blockSize, gameSetting.blockSize], [2 * gameSetting.blockSize, gameSetting.blockSize]],
		},
		'b6':{
			'width': 3,
			'height': 2,
			'color': gameSetting.colors[6],
			'position': [[gameSetting.blockSize, 0], [2 * gameSetting.blockSize, 0], [0, gameSetting.blockSize], [gameSetting.blockSize, gameSetting.blockSize]],
		},
	}

	var score = 0;
	var scoreHistory = [];
	var currentBlockType = -1;
	var storedBlocksType = -1;
	var curlevel = 1;
	var curSpeed = 1;
	var initSpeed = 1;
	var blockMaps = [];
	var paused = false;
	var usingMobile = navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i);

	gameSetting.initGame = function(){
		drawTitle();
		$('[data-for="popupTitle"]').text('Welcome!');
		$('[data-for="popupBtn"]').text('⏎ PLAY');
		//init the game control panel
		var setting = {
			type: GameControl.DirectionBtnType.Grid,
			position: GameControl.Position.BottomRight,
			buttons: {
				common: {
					num: 3
				}
			},
			mobileOnly: true
		};
		gameSetting.gameField = $('.gameField');
		GameControl.init(setting);

		GameControl.panel.find('.arrow').css({'width':'9vw', 'height': '9vw'});
		GameControl.panel.find('.controlBtn').css({
			'width':'9vw', 
			'height': '9vw',
			'line-height': '9vw',
			'border-radius': '3vw'
		});
		GameControl.panel.find('.btnRow.row1').css({
			'bottom':'16.1vw'
		});

		if (usingMobile) {
			$('.controlSec').addClass('inMob');
			if (screen.orientation.type === 'portrait-primary') {
				alert('Note: Play in landscape (horizontal) mode for better experience');
			}
		}
		bindEvents();
		
	}
	
	function startGame() {
		gameSetting.gameField.css({width: gameSetting.fieldWidth + 'px', height: gameSetting.fieldHeight + 'px'});
		$('.pauseNoti').css({width: gameSetting.fieldWidth + 'px'});
		// remove the remaining blocks
		gameSetting.gameField.empty();
		blockMaps = [];

		//reinitialise the param
		gameSetting.gameEnd = false;
		gameSetting.keyAccept = true;
		gameSetting.forceDown = false;
		gameSetting.lockStore = 0;
		curlevel = 1;
		score = 0;
		curSpeed = 1;
		initSpeed = 1;
		storedBlocksType = -1;
		$('[data-for="score"]').text(score);
		$('[data-for="level"]').text(curlevel);

		$('.nextBlocks .displayBlock').remove();
		$('.storeArea .displayBlock').hide();
		
		//initialize the point and lv
		$('[data-for="speed"]').text(curSpeed);
		initSpeed = curSpeed;
		$('#cbId').width(0);
	
	
		//create blocks array
		gameSetting.stock = [];
		for(var i = 0; i <= gameSetting.MaxPreviewBlock; i++){
			gameSetting.stock.push(self.crypto.getRandomValues(randomValArr)[0] % 7);
		}
		currentBlockType = gameSetting.stock[0];
		initBlock(gameSetting.stock.shift());
		for(var i = 0; i < gameSetting.stock.length; i++){
			$('.storeArea .displayBlock.t' + (gameSetting.stock[i] + 1)).clone().appendTo( ".nextBlocks" );
		}
		$('.nextBlocks .displayBlock').show();
		setTimeout(nextFrame, parseInt(1000/curSpeed));
	}
	
	function initBlock(bType) {
		//bTypes: 0:line, 1:square, 2:T shape, 3:L shape, 4:reverse L shape, 5:Z shape, 6:reverse Z shape
		if(bType == undefined){
			bType = self.crypto.getRandomValues(randomValArr)[0] % 7;
		}
		var groundCenter = parseInt(gameSetting.fieldWidth / 2);
		var boxColor = defaultBlocks['b' + bType].color;
		var b1 = $('<div class="boxPart falling ' + boxColor + '" ri="0" id="b' + (gameSetting.blockId++) + '"><div class="innerBox"></div></div>');
		var b2 = $('<div class="boxPart falling ' + boxColor + '" ri="0" id="b' + (gameSetting.blockId++) + '"><div class="innerBox"></div></div>');
		var b3 = $('<div class="boxPart falling ' + boxColor + '" ri="0" id="b' + (gameSetting.blockId++) + '"><div class="innerBox"></div></div>');
		var b4 = $('<div class="boxPart falling ' + boxColor + '" ri="0" id="b' + (gameSetting.blockId++) + '"><div class="innerBox"></div></div>');
		//offsets
		var xOffset = 0;
		var yOffset = 0; //- gameSetting.blockSize;
		var boxesPo;
		switch (bType) {
			case 0:
				//draw line
				var line = $.extend(true, [], defaultBlocks['b' + bType]);
				boxesPo = line.position;
				xOffset = groundCenter - 2 * gameSetting.blockSize;
				break;
			case 1:
				//draw square
				var square = $.extend(true, [], defaultBlocks['b' + bType]);
				boxesPo = square.position;
				xOffset = groundCenter - gameSetting.blockSize;
				// yOffset = 0 - 2 * gameSetting.blockSize;
				break;
			case 2:
				//draw T shape
				var Tshape = $.extend(true, [], defaultBlocks['b' + bType]);
				boxesPo = Tshape.position;
				xOffset = groundCenter - gameSetting.blockSize;
				// yOffset = 0 - 2 * gameSetting.blockSize;
				break;
			case 3:
				//draw L shape
				var lShape = $.extend(true, [], defaultBlocks['b' + bType]);
				boxesPo = lShape.position;
				xOffset = groundCenter - gameSetting.blockSize;
				// yOffset = 0 - 2 * gameSetting.blockSize;
				break;
			case 4:
				//draw reverse L shape
				var rlShape = $.extend(true, [], defaultBlocks['b' + bType]);
				boxesPo = rlShape.position;
				xOffset = groundCenter - 2 * gameSetting.blockSize;
				// yOffset = 0 - 2 * gameSetting.blockSize;
				break;
			case 5:
				//draw Z shape
				var zShape = $.extend(true, [], defaultBlocks['b' + bType]);
				boxesPo = zShape.position;
				xOffset = groundCenter - 2 * gameSetting.blockSize;
				// yOffset = 0 - 2 * gameSetting.blockSize;
				break;
			case 6:
				//draw reverse Z shape
				var rzShape = $.extend(true, [], defaultBlocks['b' + bType]);
				boxesPo = rzShape.position;
				xOffset = groundCenter - gameSetting.blockSize;
				// yOffset = 0 - 2 * gameSetting.blockSize;
				break;
		}
		var mapYs = {};
		boxesPo.some(function(position) {
			var mapX = (position[0] + xOffset) / gameSetting.blockSize, mapY = position[1] / gameSetting.blockSize;
			if(blockMaps[mapY] && blockMaps[mapY][mapX]){
				//touched
				mapYs[mapY] = 1;
				gameSetting.gameEnd = true;
			}
		});
		yOffset = - gameSetting.blockSize * Object.keys(mapYs).length;
		b1.css({'left': boxesPo[0][0] + xOffset, 'top': boxesPo[0][1] + yOffset});
		b2.css({'left': boxesPo[1][0] + xOffset, 'top': boxesPo[1][1] + yOffset});
		b3.css({'left': boxesPo[2][0] + xOffset, 'top': boxesPo[2][1] + yOffset});
		b4.css({'left': boxesPo[3][0] + xOffset, 'top': boxesPo[3][1] + yOffset});
		
		gameSetting.gameField.append(b1);
		gameSetting.gameField.append(b2);
		gameSetting.gameField.append(b3);
		gameSetting.gameField.append(b4);
	}
	
	function nextFrame() {
		if (paused) {
			return;
		}
		//change positions for falling blocks
		var fallingBlocks = $('.boxPart.falling');
		var blockTouched = detectTouch()[0];
		if(blockTouched) {
			gameSetting.forceDown = false;
			curSpeed = initSpeed;
			fallingBlocks.removeClass('falling');
			if(!gameSetting.gameEnd){
				//detect any row fully filled
				var rowFulled = detectRowFullFilled();
				if(rowFulled[0]){
					//remove those rows
					var rowsNum = rowFulled[1].length;
					removeRows(rowFulled[1]);
					upDateScore(gameSetting.scores[rowsNum - 1]);
					checkAndUpdateLevel();
				}
				//creatNewBlock
				currentBlockType = gameSetting.stock[0];
				initBlock(gameSetting.stock.shift());
				//refill blocks array if size < 4
				gameSetting.stock.push(self.crypto.getRandomValues(randomValArr)[0] % 7);
				$('.nextBlocks .displayBlock').eq(0).remove();
				$('.storeArea .displayBlock.t' + (gameSetting.stock[gameSetting.stock.length-1] + 1)).clone().appendTo( ".nextBlocks" );
				$('.nextBlocks .displayBlock').show();
				//release lock
				gameSetting.lockStore = 0;
			}
		}else{
			updateBlocksPo();
		}
		if(!gameSetting.gameEnd){
			gameSetting.keyAccept = true;
			setTimeout(nextFrame, parseInt(1000/curSpeed));
		}else{
			gameover();
		}
	}
	
	function updateBlocksPo(direction) {
		var fallingBlocks = $('.boxPart.falling');
		if(direction == undefined){
			direction = 'down';
		}
		var offSetY = 0, offSetX = 0;
		switch (direction) {
			case 'down':
				offSetY = gameSetting.blockSize;
				break;
			case 'left':
				offSetX = - gameSetting.blockSize;
				break;
			case 'right':
				offSetX = gameSetting.blockSize;
				break;
		}
		fallingBlocks.each(function () {
			var yP = parseInt($(this).css('top').split('px')[0]);
			var xP = parseInt($(this).css('left').split('px')[0]);
			var nextYP = yP + offSetY;
			var nextXP = xP + offSetX;
			$(this).css({'top': nextYP, 'left': nextXP});
		});
	}
	
	function detectTouch(direction) {
		var fallingBlocks = $('.boxPart.falling');
		var touchResult = false;
		var tmpPositions = [], boxIds = [];
		var touchPoint = '';
		if(direction == undefined){
			direction = 'down';
		}
		fallingBlocks.each(function () {
			var yP = parseInt($(this).css('top').split('px')[0]);
			var xP = parseInt($(this).css('left').split('px')[0]);
			var nextYP = yP;
			var nextXP = xP;
			var currentPo = xP + ',' + yP;
			//var touchNextYP = yP + gameSetting.blockSize;//use to detect any block blow after touching block
			switch (direction) {
				case 'down':
					nextYP = yP + gameSetting.blockSize;
					break;
				case 'left':
					nextXP = xP - gameSetting.blockSize;
					break;
				case 'right':
					nextXP = xP + gameSetting.blockSize;
					break;
			}
			tmpPositions.push(currentPo);
			boxIds.push($(this).attr('id'));
			if(nextYP >= gameSetting.fieldHeight){
				touchResult = true;
				touchPoint = 'bottom';
			}
			var mapX = nextXP / gameSetting.blockSize, mapY = nextYP / gameSetting.blockSize;
			if(direction == 'down' && blockMaps[mapY] && blockMaps[mapY][mapX]){
				touchResult = true;
				//touchPoint = 'block';
			}else if(blockMaps[mapY] && blockMaps[mapY][mapX]){
				touchPoint = 'block';
			}
			if(nextXP < 0 || nextXP >= gameSetting.fieldWidth){
				touchPoint = 'wall';
			}
		});
		if(touchResult){
			tmpPositions.forEach(function (item, index) {
				var tmpxy = item.split(',');
				var tmpX = parseInt(tmpxy[0])/gameSetting.blockSize, tmpY = parseInt(tmpxy[1])/gameSetting.blockSize;
				if(blockMaps[tmpY]){
					blockMaps[tmpY][tmpX] = boxIds[index];
				}else{
					blockMaps[tmpY] = [];
					blockMaps[tmpY][tmpX] = boxIds[index];
				}
			})
		}
		return [touchResult, touchPoint];
	}
	
	function gameover() {
		$('[data-for="popupTitle"]').text('You lose');
		$('[data-for="popupBtn"]').text('⏎ RESTART');
		$('.endingPopUp').show();
		scoreHistory.push(score);
		updateScoreRanking();
	}
	
	function rotateBlock() {
		//default rotate counter clockwise
		//bTypes: 0:line, 1:square, 2:T shape, 3:L shape, 4:reverse L shape, 5:Z shape, 6:reverse Z shape
		var fallingBlocks = $('.boxPart.falling');
		if(currentBlockType !== 1){
			//blocks other than square
			var centerBlock, xC, yC, rotateT, xOffSet = 0, yOffSet = 0, touched = false, tmpPos = [], yOffset2 = 0;
			switch (currentBlockType) {
				case 0:
					//center:b3
					centerBlock = $('.boxPart.falling').eq(2);
					break;
				case 2:
					//center:b3
					centerBlock = $('.boxPart.falling').eq(2);
					break;
				case 3:
					//center:b2
					centerBlock = $('.boxPart.falling').eq(1);
					break;
				case 4:
					//center:b3
					centerBlock = $('.boxPart.falling').eq(2);
					break;
				case 5:
					//center:b2
					centerBlock = $('.boxPart.falling').eq(1);
					break;
				case 6:
					//center:b1
					centerBlock = $('.boxPart.falling').eq(0);
					break;
			}
			rotateT = parseInt(centerBlock.attr('ri'));
			switch (rotateT) {
				case 0:
					yOffSet = gameSetting.blockSize;
					break;
				case 1:
					xOffSet = gameSetting.blockSize;
					yOffSet = gameSetting.blockSize;
					break;
				case 2:
					xOffSet = gameSetting.blockSize;
					break;
				case 3:
					break;
			}
			yOffset2 = -gameSetting.blockSize;
			xC = centerBlock.position().left + xOffSet;
			yC = centerBlock.position().top + yOffSet;
			var xOffset2 = 0;//move blocks if touch wall when rotate
			fallingBlocks.each(function () {
				var resultX = $(this).position().top + xC - yC;
				var resultY = yC + xC - $(this).position().left + yOffset2;
				// var nextPo = resultX + ',' + resultY;
				var mapX = resultX / gameSetting.blockSize, mapY = resultY / gameSetting.blockSize;
				var maxX = gameSetting.fieldWidth / gameSetting.blockSize - 1;//map width in unit of block size
				var maxY = gameSetting.fieldHeight / gameSetting.blockSize - 1;
				if(blockMaps[mapY] && blockMaps[mapY][mapX]){
					touched = true;
				} 
				else if (mapY > maxY) {
					//touch the bottom
					touched = true;
				}
				else{
					if(mapX < 0){
						//touch the left wall
						var xOffsetTmp = Math.abs(mapX) * gameSetting.blockSize;
						if(xOffset2 < xOffsetTmp){
							xOffset2 = xOffsetTmp;
						}
					}else if(mapX > maxX){
						//touch the right wall
						var xOffsetTmp = (maxX - mapX) * gameSetting.blockSize;
						if(xOffset2 > xOffsetTmp){
							xOffset2 = xOffsetTmp;
						}
					}
					tmpPos.push([resultX, resultY]);
				}
			});
			if(!touched){
				tmpPos.forEach(function (value,index) {
					fallingBlocks.eq(index).css({'left': value[0] + xOffset2, 'top': value[1]});
				});
				rotateT = (rotateT + 1) % 4;
				centerBlock.attr('ri', rotateT);
			}
		}
	}
	
	function detectRowFullFilled() {
		var filled = [], fullSize = gameSetting.fieldWidth/gameSetting.blockSize;
		var result = false;
		for(var i in blockMaps){
			if(Object.keys(blockMaps[i]).length == fullSize){
				filled.push(i);
				result = true;
			}
		}
		return [result, filled];
	}
	
	function removeRows(rows) {
		for(var i = 0; i < rows.length; i++){
			var now = parseInt(rows[i]);
			// var targetR = now + 1;
			var tmpMap = [];
			if(i + 1 < rows.length){
				//debugger;
				var nextId = i+1;
				var nowTmpId = i;
				// var next = parseInt(rows[nextId]);
				while(rows[nextId] - rows[nowTmpId] == 1 && nextId < rows.length){
					nextId++;
					nowTmpId++;
				}
				var continuesRowNum = nowTmpId - i + 1;
				var yOffset = continuesRowNum * gameSetting.blockSize;
				for(var j = 0; j < continuesRowNum; j++){
					blockMaps[now + j].forEach(function (val) {
						$('#'+val).remove();
					});
					delete blockMaps[now + j];
				}
				//low down the block
				for(var j in blockMaps){
					if(j >= now){
						break;
					}
					blockMaps[j].forEach(function (val) {
						$('#'+val).css('top', parseInt($('#'+val).css('top').split('px')[0]) + yOffset);
					});
					tmpMap[parseInt(j) + continuesRowNum] = $.extend(true, [], blockMaps[j]);
					delete blockMaps[j];
				}
				for(var j in tmpMap){
					blockMaps[j] = $.extend(true, [], tmpMap[j]);
				}
				i = nowTmpId;
			}else{
				blockMaps[now].forEach(function (val) {
					$('#'+val).remove();
				})
				var yOffset = gameSetting.blockSize;
				//low down the block
				for(var j in blockMaps){
					if(j >= now){
						break;
					}
					blockMaps[j].forEach(function (val) {
						$('#'+val).css('top', parseInt($('#'+val).css('top').split('px')[0]) + yOffset);
					});
					tmpMap[parseInt(j) + 1] = $.extend(true, [], blockMaps[j]);
					delete blockMaps[j];
				}
				for(var j in tmpMap){
					blockMaps[j] = $.extend(true, [], tmpMap[j]);
				}
			}
		}
	}
	
	function upDateScore(point) {
		score += point;
		$('[data-for="score"]').text(score);
	}

	function drawTitle() {
		var titleArea = $('[data-for="title"]');
		titleArea.empty();
		var rowNum = gameTitle.length;
		var colNum = gameTitle[0].length;
		var boxHTML = '<div class="boxPart"><div class="innerBox"></div></div>';
		for (let cId = 0; cId < colNum; cId++) {
			let colorId = 0;
			if (cId > 0) {
				colorId = Math.ceil(cId / 6) - 1;
			}
			let color = gameSetting.colors[colorId];
			let leftPos = cId * 15;
			for (let rId = 0; rId < rowNum; rId++) {
				if (gameTitle[rId][cId]) {
					let topPos = rId * 15;
					let newBox = $(boxHTML);
					titleArea.append(newBox);
					newBox.addClass(color);
					newBox.css({'left': leftPos, 'top': topPos});
				}
			}
		}
	}

	function bindEvents() {
		function move(direction) {
			var touchDetection = detectTouch(direction);
			if(touchDetection[0] || touchDetection[1] !== ''){
				//do nothing
			}else{
				//move right
				updateBlocksPo(direction);
			}
		}

		function forceDown() {
			gameSetting.forceDown = true;
			initSpeed = curSpeed;
			curSpeed = gameSetting.forceDownSpeed;
		}

		function pasueGame() {
			if (gameSetting.gameEnd) {
				return;
			}
			paused = !paused;
			gameSetting.gameField.parent().toggleClass('gamePaused', paused);
			if (!paused) {
				setTimeout(nextFrame, parseInt(1000/curSpeed));
			}
		}

		// var gameField = gameSetting.gameField;
		$(document).off('keyup').keyup(function(e){
			if (e.keyCode == 67) {
				pasueGame();
			}
		});

		$(document).off('keydown').keydown(function(evt){
			// console.log(evt.keyCode);
			if(!paused && gameSetting.keyAccept && !gameSetting.forceDown){
				//gameSetting.keyAccept = false;
				if(evt.keyCode == 37){
					//left arrow
					move('left');
				}
				else if(evt.keyCode == 38){
					//up arrow
					forceDown();
				}
				else if(evt.keyCode == 39){
					//right arrow
					move('right');
				}
				else if(evt.keyCode == 40){
					//down arrow
					move('down');
				}
				else if(evt.keyCode == 32){
					//rotate blocks (Space)
					rotateBlock();
				}
				else if(evt.keyCode == 90){
					storeBlock();
				}
			}
			if($('.endingPopUp').css('display') == 'block'){
				if(evt.keyCode == 13){
					//Enter to restar or next level
					$('.restart').click();
				}
			}
		});
		
		$('.restart').off('click').click(function(e){
			e.stopPropagation();
			$('.endingPopUp').hide();
			startGame();
		});
		
		GameControl.bindKeyPressEvent(GameControl.Keys.Up, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!paused && gameSetting.keyAccept && !gameSetting.forceDown){
				forceDown();
			}
		});

		GameControl.bindKeyPressEvent(GameControl.Keys.Down, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!paused && gameSetting.keyAccept && !gameSetting.forceDown){
				move('down');
			}
		});

		GameControl.bindKeyPressEvent(GameControl.Keys.Left, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!paused && gameSetting.keyAccept && !gameSetting.forceDown){
				move('left');
			}
		});

		GameControl.bindKeyPressEvent(GameControl.Keys.Right, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!paused && gameSetting.keyAccept && !gameSetting.forceDown){
				move('right');
			}
		});

		GameControl.bindKeyPressEvent(GameControl.Keys.Btn_0, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!paused && gameSetting.keyAccept && !gameSetting.forceDown){
				rotateBlock();
			}
		});

		GameControl.bindKeyPressEvent(GameControl.Keys.Btn_1, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!paused && gameSetting.keyAccept && !gameSetting.forceDown){
				storeBlock();
			}
		});

		GameControl.bindKeyPressEvent(GameControl.Keys.Btn_2, function(e){
			e.stopPropagation();
			e.preventDefault();
			pasueGame();
		});
	}

	function storeBlock() {
		if(!gameSetting.lockStore){
			gameSetting.lockStore = 1;
			//hide all blcoks first
			$('.storeArea .displayBlock').hide();
			//show current blcok
			$('.storeArea .displayBlock.t' + (currentBlockType + 1)).show();
			//change block if has storation
			var fallingBlocks = $('.boxPart.falling');
			if(storedBlocksType > -1){
				let newBlockType = currentBlockType;
				currentBlockType = storedBlocksType;
				storedBlocksType = newBlockType;
				//add old blocks to the field
				initBlock(currentBlockType);
				//remove last blocks
				fallingBlocks.remove();
			}else{
				storedBlocksType = currentBlockType;
				fallingBlocks.remove();
				//init blocks
				initBlock(gameSetting.stock.shift());
				//refill blocks array if size < 4
				gameSetting.stock.push(self.crypto.getRandomValues(randomValArr)[0] % 7);
				$('.nextBlocks .displayBlock').eq(0).remove();
				$('.storeArea .displayBlock.t' + (gameSetting.stock[gameSetting.stock.length-1] + 1)).clone().appendTo( ".nextBlocks" );
				$('.nextBlocks .displayBlock').show();
			}
		}
	}

	function updateScoreRanking() {
		var rankingBoard = $('[data-for="ranking"]');
		rankingBoard.empty();
		scoreHistory = scoreHistory.sort((a,b) => b-a).slice(0,6);
		scoreHistory.forEach(function(item) {
			rankingBoard.append('<li>' + item + '</li>');
		});
	}

	function checkAndUpdateLevel() {
		var tmp = score / gameSetting.levelDifficulty;
		if (tmp == curlevel) {
			tmp++;
		}
		if (tmp > curlevel) {
			curSpeed = curlevel = parseInt(tmp);
			$('[data-for="speed"]').text(curSpeed);
			initSpeed = curSpeed;
			$('[data-for="level"]').text(curlevel);
		}
	}
});
